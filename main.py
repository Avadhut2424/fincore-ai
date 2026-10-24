from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

import database
import models
import ml_engine

# Initialize Database Schema
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="FinCore Enterprise Data Warehouse API")

# Allow React UI to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Startup event to populate Data Warehouse & Train ML
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        ml_engine.generate_and_train_model(db)
    finally:
        db.close()

# --- Pydantic Schemas ---
class ApplicantCreate(BaseModel):
    name: str
    income: float
    credit_score: int
    loan_amount: float
    employment_years: float
    prior_default: bool

class StatusUpdate(BaseModel):
    status: str

# --- Endpoints ---

@app.get("/api/applicants")
def get_applicants(db: Session = Depends(get_db)):
    """
    Query the Data Warehouse (Star Schema).
    Joins FactApplication with DimApplicant and DimCreditProfile.
    """
    facts = db.query(models.FactApplication).order_by(models.FactApplication.id.desc()).limit(100).all()
    
    results = []
    for f in facts:
        results.append({
            "id": f.id,
            "name": f.applicant.name,
            "income": f.applicant.income,
            "credit_score": f.credit_profile.credit_score,
            "loan_amount": f.loan_amount,
            "employment_years": f.applicant.employment_years,
            "prior_default": f.credit_profile.prior_default,
            "status": f.final_status,
            "confidence": f.ml_confidence
        })
    return results

@app.post("/api/applicants")
def create_applicant(app_in: ApplicantCreate, db: Session = Depends(get_db)):
    """
    Inserts a new record into the Dimensions and Fact tables.
    Runs ML prediction instantly.
    """
    # 1. Run ML Model
    status, confidence = ml_engine.predict_risk(
        app_in.income, app_in.credit_score, app_in.loan_amount, 
        app_in.employment_years, app_in.prior_default
    )
    
    # 2. Insert into Dimensions
    # Get or create default geography
    geo = db.query(models.DimGeography).first()
    if not geo:
        geo = models.DimGeography(region_code="NA-1")
        db.add(geo)
        db.commit()
        
    app_dim = models.DimApplicant(
        name=app_in.name, 
        income=app_in.income, 
        employment_years=app_in.employment_years,
        geo_id=geo.id
    )
    db.add(app_dim)
    
    cred_dim = models.DimCreditProfile(
        credit_score=app_in.credit_score, 
        prior_default=app_in.prior_default
    )
    db.add(cred_dim)
    
    time_dim = models.DimTime() # Defaults to now
    db.add(time_dim)
    
    db.commit() # Flush dimensions to get IDs
    
    # 3. Insert into Fact table
    fact = models.FactApplication(
        applicant_id=app_dim.id,
        credit_profile_id=cred_dim.id,
        time_id=time_dim.id,
        loan_amount=app_in.loan_amount,
        ml_confidence=confidence,
        final_status=status
    )
    db.add(fact)
    db.commit()
    db.refresh(fact)
    
    return {
        "id": fact.id,
        "name": app_dim.name,
        "status": status,
        "confidence": confidence
    }

@app.post("/api/simulate")
def simulate_applicant(app_in: ApplicantCreate):
    """Runs prediction without saving to the Data Warehouse."""
    status, confidence = ml_engine.predict_risk(
        app_in.income, app_in.credit_score, app_in.loan_amount, 
        app_in.employment_years, app_in.prior_default
    )
    return {"status": status, "confidence": confidence}

@app.put("/api/applicants/{fact_id}/status")
def update_status(fact_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    """Manual Override: Updates the final_status in the Fact table."""
    fact = db.query(models.FactApplication).filter(models.FactApplication.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact record not found")
    
    fact.final_status = status_update.status
    db.commit()
    return {"success": True}

@app.delete("/api/applicants/{fact_id}")
def delete_applicant(fact_id: int, db: Session = Depends(get_db)):
    fact = db.query(models.FactApplication).filter(models.FactApplication.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact record not found")
        
    db.delete(fact)
    db.commit()
    return {"success": True}
