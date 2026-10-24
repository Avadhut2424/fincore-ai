from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

# --- SNOWFLAKE DIMENSION ---
class DimGeography(Base):
    __tablename__ = "dim_geography"
    id = Column(Integer, primary_key=True, index=True)
    region_code = Column(String, index=True)
    country = Column(String, default="US")
    applicants = relationship("DimApplicant", back_populates="geography")

# --- STAR DIMENSIONS ---
class DimApplicant(Base):
    __tablename__ = "dim_applicants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    income = Column(Float)
    employment_years = Column(Float)
    geo_id = Column(Integer, ForeignKey("dim_geography.id"))
    
    geography = relationship("DimGeography", back_populates="applicants")
    facts = relationship("FactApplication", back_populates="applicant")

class DimCreditProfile(Base):
    __tablename__ = "dim_credit_profiles"
    id = Column(Integer, primary_key=True, index=True)
    credit_score = Column(Integer)
    prior_default = Column(Boolean)
    
    facts = relationship("FactApplication", back_populates="credit_profile")

class DimTime(Base):
    __tablename__ = "dim_time"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    year = Column(Integer)
    month = Column(Integer)
    day = Column(Integer)
    
    facts = relationship("FactApplication", back_populates="time")

# --- FACT TABLE ---
class FactApplication(Base):
    __tablename__ = "fact_applications"
    id = Column(Integer, primary_key=True, index=True)
    
    applicant_id = Column(Integer, ForeignKey("dim_applicants.id"))
    credit_profile_id = Column(Integer, ForeignKey("dim_credit_profiles.id"))
    time_id = Column(Integer, ForeignKey("dim_time.id"))
    
    loan_amount = Column(Float)
    ml_confidence = Column(Float)
    final_status = Column(String) # Approved, Rejected, Review
    
    applicant = relationship("DimApplicant", back_populates="facts")
    credit_profile = relationship("DimCreditProfile", back_populates="facts")
    time = relationship("DimTime", back_populates="facts")
