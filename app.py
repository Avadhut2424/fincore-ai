from flask import Flask, render_template, request, redirect, url_for, flash
from extensions import db
from models import Applicant
import ml_engine
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'fincore_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fincore.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize Database and ML Model
with app.app_context():
    db.create_all()
    ml_engine.generate_synthetic_data(app)
    ml_engine.train_model(app)

@app.route('/')
def index():
    applicants = Applicant.query.all()
    return render_template('index.html', applicants=applicants)

@app.route('/add', methods=['GET', 'POST'])
def add_applicant():
    if request.method == 'POST':
        name = request.form['name']
        income = float(request.form['income'])
        credit_score = int(request.form['credit_score'])
        loan_amount = float(request.form['loan_amount'])
        employment_years = float(request.form['employment_years'])
        prior_default = 'prior_default' in request.form
        
        # Determine status automatically using our ML model!
        status = ml_engine.predict_approval(income, credit_score, loan_amount, employment_years, prior_default)
        
        applicant = Applicant(
            name=name,
            income=income,
            credit_score=credit_score,
            loan_amount=loan_amount,
            employment_years=employment_years,
            prior_default=prior_default,
            loan_status=status
        )
        db.session.add(applicant)
        db.session.commit()
        
        # Retrain model with new data
        ml_engine.train_model(app)
        
        flash(f'Applicant {name} added successfully. Predicted Status: {status}', 'success')
        return redirect(url_for('index'))
        
    return render_template('add.html', edit=False)

@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit_applicant(id):
    applicant = Applicant.query.get_or_404(id)
    if request.method == 'POST':
        applicant.name = request.form['name']
        applicant.income = float(request.form['income'])
        applicant.credit_score = int(request.form['credit_score'])
        applicant.loan_amount = float(request.form['loan_amount'])
        applicant.employment_years = float(request.form['employment_years'])
        applicant.prior_default = 'prior_default' in request.form
        
        # Predict status again in case features changed significantly
        applicant.loan_status = ml_engine.predict_approval(
            applicant.income, applicant.credit_score, 
            applicant.loan_amount, applicant.employment_years, applicant.prior_default
        )
        
        db.session.commit()
        ml_engine.train_model(app) # Retrain
        
        flash(f'Applicant {applicant.name} updated successfully.', 'success')
        return redirect(url_for('index'))
        
    return render_template('add.html', edit=True, applicant=applicant)

@app.route('/delete/<int:id>', methods=['POST'])
def delete_applicant(id):
    applicant = Applicant.query.get_or_404(id)
    db.session.delete(applicant)
    db.session.commit()
    ml_engine.train_model(app) # Retrain
    flash('Applicant deleted successfully.', 'danger')
    return redirect(url_for('index'))

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    prediction = None
    if request.method == 'POST':
        income = float(request.form['income'])
        credit_score = int(request.form['credit_score'])
        loan_amount = float(request.form['loan_amount'])
        employment_years = float(request.form['employment_years'])
        prior_default = 'prior_default' in request.form
        
        prediction = ml_engine.predict_approval(
            income, credit_score, loan_amount, employment_years, prior_default
        )
    return render_template('predict.html', prediction=prediction)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
