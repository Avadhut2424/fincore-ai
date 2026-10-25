# FinCore AI — Autonomous Loan Origination & Dimensional Risk Warehouse

[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **FinCore AI** is an enterprise-grade automated loan origination, credit risk underwriting, and dimensional analytical warehouse platform. It integrates a high-performance **FastAPI** service, an automated **Random Forest credit scoring engine**, a **Star Schema Data Warehouse** (SQLAlchemy), and a state-of-the-art **React + Vite** executive intelligence workstation.

---

## 1. System Status & Implementation Phases

| Phase | Milestone | Key Technologies | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Star Schema Modeling** | SQLAlchemy, SQLite/PostgreSQL | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 2** | **Credit Risk ML Engine** | Scikit-Learn, Random Forest, NumPy | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 3** | **Warehouse REST API** | FastAPI, Pydantic, CORS Middleware | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 4** | **Risk Simulation Sandbox** | Feature perturbation, Instant Scoring | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 5** | **Underwriter Override Control**| RESTful PATCH/PUT, Audit Trails | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 6** | **Executive Intelligence UI** | React 19, Lucide Icons, Glassmorphism | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 7** | **Containerization & DevEx** | Docker, Docker Compose, Makefile | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |
| **Phase 8** | **Benchmarking & Validation** | Automated Metrics, Confusion Matrix | ![Completed](https://img.shields.io/badge/Status-Completed-brightgreen) |

---

## 2. Architecture & Data Flow

### 2.1 Star Schema Dimensional Warehouse Model
FinCore AI organizes credit applications into an analytical Star Schema, optimizing query speeds for high-volume portfolio surveillance and real-time underwriting.

```mermaid
erDiagram
    DIM_GEOGRAPHY ||--o{ DIM_APPLICANT : "locates"
    DIM_APPLICANT ||--o{ FACT_APPLICATION : "submits"
    DIM_CREDIT_PROFILE ||--o{ FACT_APPLICATION : "evaluates"
    DIM_TIME ||--o{ FACT_APPLICATION : "records"

    DIM_GEOGRAPHY {
        int id PK
        string region_code
        string country
    }

    DIM_APPLICANT {
        int id PK
        string name
        float income
        float employment_years
        int geo_id FK
    }

    DIM_CREDIT_PROFILE {
        int id PK
        int credit_score
        boolean prior_default
    }

    DIM_TIME {
        int id PK
        datetime timestamp
        int year
        int month
        int day
    }

    FACT_APPLICATION {
        int id PK
        int applicant_id FK
        int credit_profile_id FK
        int time_id FK
        float loan_amount
        float ml_confidence
        string final_status
    }
```

### 2.2 End-to-End Decision & Underwriting Flow

```mermaid
sequenceDiagram
    autonumber
    actor LoanOfficer as Underwriter / Client
    participant UI as React Intelligence UI
    participant API as FastAPI Backend (main.py)
    participant ML as ML Risk Engine (ml_engine.py)
    participant DW as Star Schema Warehouse (models.py)

    LoanOfficer->>UI: Enter applicant parameters
    alt Simulation Mode (Sandbox)
        UI->>API: POST /api/simulate
        API->>ML: predict_risk(income, credit_score, loan, emp, default)
        ML-->>API: (Status, Confidence Score)
        API-->>UI: Real-time decision & risk gauge
    else Formal Application
        UI->>API: POST /api/applicants
        API->>ML: predict_risk(...)
        ML-->>API: (Status, Confidence)
        API->>DW: Commit Dimensions (Applicant, Credit, Time, Geo)
        API->>DW: Commit FactApplication record
        DW-->>API: Confirmation (Fact ID)
        API-->>UI: 201 Created & Pipeline updated
    end
    LoanOfficer->>UI: Manual Underwriter Override (Optional)
    UI->>API: PUT /api/applicants/{id}/status
    API->>DW: Update final_status in FactApplication
    DW-->>API: Success
    API-->>UI: Refreshed Application State
```

---

## 3. Cold Start Setup Guide

### 3.1 Prerequisites
- **Python**: Version 3.10 or 3.11+
- **Node.js**: Version 18.0+ or 20.0+ (with npm 9+)
- **Docker & Docker Compose** (Optional, for containerized run)

---

### 3.2 Quickstart with Docker Compose (Recommended)

Run the entire stack (FastAPI Backend + React Frontend) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/Avadhut2424/fincore-ai.git
cd fincore-ai

# 2. Configure environment
cp .env.example .env

# 3. Build and launch services
docker compose up --build
```
- **Backend API**: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)
- **React Frontend**: `http://localhost:5173`

---

### 3.3 Manual Local Development Setup

#### Step 1: Backend Setup
```bash
# 1. Create and activate a Python virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI warehouse server
uvicorn main:app --reload --port 8000
```
*Note: On first startup, the application initializes the Star Schema tables and populates the warehouse with calibrated synthetic credit data (`500+ records`), automatically fitting the Random Forest underwriting model.*

#### Step 2: Frontend Setup
```bash
# 1. Navigate to frontend directory
cd react-frontend

# 2. Install npm packages
npm install

# 3. Start Vite dev server
npm run dev
```
Access the application at **`http://localhost:5173`**.

---

## 4. API Reference

All requests and responses use standard JSON formatting. Interactive OpenAPI documentation is accessible at `/docs` or `/redoc`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/applicants` | Queries the dimensional warehouse and returns recent loan applications. |
| `POST` | `/api/applicants` | Ingests new dimensions, scores credit risk, and writes to `FactApplication`. |
| `POST` | `/api/simulate` | Evaluates credit application risk in real-time without persisting to warehouse. |
| `PUT` | `/api/applicants/{id}/status` | Manual risk officer override of underwriting recommendation. |
| `DELETE` | `/api/applicants/{id}` | Purges fact record from warehouse. |

### Example: Credit Risk Simulation
```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "income": 95000,
    "credit_score": 740,
    "loan_amount": 25000,
    "employment_years": 6.5,
    "prior_default": false
  }'
```
**Response:**
```json
{
  "status": "Approved",
  "confidence": 94.2
}
```

---

## 5. Machine Learning Risk Scorecard Methodology

The underwriting engine uses a calibrated **Random Forest Ensemble** (`n_estimators=100`, `random_state=42`) trained on multi-dimensional applicant profiles:

### Key Risk Factors & Weights:
1. **Debt-to-Income / Capacity**: Compares stated annual income against requested loan capital.
2. **Credit Bureau Score**: Weighted FICO rating range from 300 to 850.
3. **Employment Stability**: Duration in workforce mitigating economic downturn shocks.
4. **Historical Delinquency**: Prior defaults act as a severe non-linear risk penalty.

### Decision Threshold Tiers:
- **`Approved`** ($\text{Confidence} \ge 70\%$): Fast-track automated qualification.
- **`Review`** ($40\% \le \text{Confidence} < 70\%$): Escalated to senior credit underwriter for manual assessment.
- **`Rejected`** ($\text{Confidence} < 40\%$): High default risk based on historical dimensional patterns.

---

## 6. Directory Layout

```
fincore-ai/
├── .env.example             # Template environment configuration
├── .gitignore               # Ignored venv, build, node_modules, and cache files
├── Antigravity.md           # Engineering architecture and system design record
├── Dockerfile               # Production container definition for backend API
├── docker-compose.yml       # Multi-container orchestration (FastAPI + React UI)
├── Makefile                 # Common developer targets (install, run, test, clean)
├── METRICS.md               # Empirical evaluation and model performance benchmarks
├── Objectives.md            # Platform goals, SLA benchmarks, and compliance standards
├── README.md                # Comprehensive documentation
├── requirements.txt         # Pinned Python package dependencies
├── main.py                  # FastAPI warehouse & scoring gateway
├── app.py                   # Alternative/legacy lightweight Flask interface
├── database.py              # SQLAlchemy database engine & session pool
├── models.py                # Star Schema dimensional entities & relationships
├── ml_engine.py             # Random Forest training & predictive inference
├── push_to_github.bat       # Helper automation script for version control
├── run.bat                  # One-click startup helper for Windows
├── react-frontend/          # React 19 + Vite executive intelligence application
│   ├── src/
│   │   ├── App.jsx          # Comprehensive loan origination workstation
│   │   ├── main.jsx         # Application entry point
│   │   ├── index.css        # Clean base styling
│   ├── index.html           # HTML5 shell
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
└── templates/               # Flask Jinja2 server-rendered templates
```

---

## 7. Troubleshooting & Operational Gotchas

1. **SQLite Database Locking**:
   - In high-concurrency environments, SQLite may produce `database is locked`. For production deployments, switch `DATABASE_URL` in `.env` to PostgreSQL: `postgresql://user:pass@localhost:5432/fincore`.
2. **CORS Configuration**:
   - The FastAPI backend includes `CORSMiddleware` with `allow_origins=["*"]`. In locked-down production environments, restrict this to your specific domain.
3. **Port Conflicts**:
   - FastAPI defaults to port `8000` and React Vite to `5173`. If either is occupied, specify `--port` flags in `uvicorn` and Vite's config.

---

## 8. License

Distributed under the **MIT License**. See `LICENSE` for more information.
