import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sqlalchemy.orm import Session
from models import DimApplicant, DimCreditProfile, DimTime, FactApplication, DimGeography
import datetime

# Global model instance
model = None

def generate_and_train_model(db: Session):
    """
    Simulates fetching a high-quality credit risk dataset (e.g., German Credit Data) 
    and mapping it to our Star Schema dimensions.
    Because our React UI relies on 5 specific fields (income, credit_score, loan_amount, emp_years, default),
    we generate a highly correlated synthetic dataset that mimics real-world dimensional data.
    """
    global model
    
    # Check if we already have data
    if db.query(FactApplication).count() > 0:
        print("Data Warehouse already populated. Loading model...")
        _train_on_warehouse_data(db)
        return

    print("Populating Data Warehouse Dimensions and Facts...")
    np.random.seed(42)
    n = 500 # 500 records for the warehouse
    
    # Generate realistic correlated data
    incomes = np.random.normal(70000, 25000, n).clip(20000, 250000)
    credit_scores = np.random.normal(680, 70, n).clip(300, 850)
    loan_amounts = incomes * np.random.uniform(0.1, 1.5, n)
    emp_years = np.random.normal(5, 4, n).clip(0, 40)
    
    # Prior default is highly correlated with low credit scores
    prior_defaults = (credit_scores < 600) | (np.random.rand(n) < 0.05)
    
    # Calculate ML proxy score
    scores = np.zeros(n)
    scores += (incomes > loan_amounts * 1.5).astype(int)
    scores += (credit_scores > 650).astype(int)
    scores += (emp_years >= 2).astype(int)
    scores -= prior_defaults.astype(int) * 3
    
    # Target variable
    statuses = ['Approved' if s >= 2 else 'Review' if s == 1 else 'Rejected' for s in scores]
    confidences = np.random.uniform(0.85, 0.99, n)

    # 1. Create a default Geography Dimension
    geo = DimGeography(region_code="NA-1", country="US")
    db.add(geo)
    db.commit()

    for i in range(n):
        # 2. Populate Dimensions
        app_dim = DimApplicant(
            name=f"Applicant {i+1}",
            income=float(incomes[i]),
            employment_years=float(emp_years[i]),
            geo_id=geo.id
        )
        db.add(app_dim)
        
        cred_dim = DimCreditProfile(
            credit_score=int(credit_scores[i]),
            prior_default=bool(prior_defaults[i])
        )
        db.add(cred_dim)
        
        # Randomize timestamps over the last year
        random_days_ago = np.random.randint(0, 365)
        dt = datetime.datetime.utcnow() - datetime.timedelta(days=random_days_ago)
        time_dim = DimTime(
            timestamp=dt,
            year=dt.year,
            month=dt.month,
            day=dt.day
        )
        db.add(time_dim)
        db.commit() # Commit to get IDs
        
        # 3. Populate Fact Table
        fact = FactApplication(
            applicant_id=app_dim.id,
            credit_profile_id=cred_dim.id,
            time_id=time_dim.id,
            loan_amount=float(loan_amounts[i]),
            ml_confidence=float(confidences[i]),
            final_status=statuses[i]
        )
        db.add(fact)
        
    db.commit()
    print("Data Warehouse populated successfully.")
    
    _train_on_warehouse_data(db)

def _train_on_warehouse_data(db: Session):
    global model
    facts = db.query(FactApplication).all()
    
    data = []
    for f in facts:
        # Join dimensions to build training set
        data.append({
            'income': f.applicant.income,
            'credit_score': f.credit_profile.credit_score,
            'loan_amount': f.loan_amount,
            'employment_years': f.applicant.employment_years,
            'prior_default': int(f.credit_profile.prior_default),
            'target': 1 if f.final_status == 'Approved' else (0.5 if f.final_status == 'Review' else 0)
        })
        
    df = pd.DataFrame(data)
    # We binarize target for classification: Approved (1) vs Rejected/Review (0)
    # The actual business logic will handle 'Review' based on probability threshold
    X = df.drop('target', axis=1)
    y = (df['target'] == 1).astype(int) 
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    print("Random Forest Model trained on Warehouse Data.")

def predict_risk(income, credit_score, loan_amount, employment_years, prior_default):
    global model
    if model is None:
        return "Rejected", 0.0
        
    X_new = pd.DataFrame([{
        'income': float(income),
        'credit_score': int(credit_score),
        'loan_amount': float(loan_amount),
        'employment_years': float(employment_years),
        'prior_default': int(prior_default)
    }])
    
    prob = model.predict_proba(X_new)[0][1] # Probability of 'Approved'
    
    if prob > 0.7:
        status = 'Approved'
    elif prob > 0.4:
        status = 'Review'
    else:
        status = 'Rejected'
        
    return status, round(prob * 100, 2)
