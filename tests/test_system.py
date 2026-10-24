import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
import ml_engine

# Use an in-memory SQLite database for test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(TEST_DATABASE_URL)
    models.Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        # Seed and train ML model in memory
        ml_engine.generate_and_train_model(session)
        yield session
    finally:
        session.close()

def test_ml_risk_engine_bounds(db_session):
    # Prime applicant: high income, excellent credit, no defaults
    status_approved, conf_approved = ml_engine.predict_risk(
        income=180000, credit_score=800, loan_amount=25000,
        employment_years=10, prior_default=False
    )
    assert status_approved == "Approved"
    assert conf_approved >= 70.0

    # High risk applicant: low income, low credit, previous default
    status_rejected, conf_rejected = ml_engine.predict_risk(
        income=25000, credit_score=450, loan_amount=90000,
        employment_years=0.5, prior_default=True
    )
    assert status_rejected in ["Rejected", "Review"]
    assert conf_rejected < 70.0

def test_star_schema_relationships(db_session):
    # Verify that dimensions and facts link correctly
    facts = db_session.query(models.FactApplication).all()
    assert len(facts) > 0
    first_fact = facts[0]
    
    assert first_fact.applicant is not None
    assert first_fact.credit_profile is not None
    assert first_fact.time is not None
    assert first_fact.final_status in ["Approved", "Review", "Rejected"]
