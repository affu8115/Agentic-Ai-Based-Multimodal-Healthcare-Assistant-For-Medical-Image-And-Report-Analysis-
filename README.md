# Agentic AI-Based Multimodal Healthcare Assistant for Medical Image and Report Analysis

**B.Tech Final-Year Capstone Project**  
*An Educational  Healthcare Desicion-Support Multi-Agent System*

---

## 1. Project Purpose & Overview

The **Agentic AI-Based Multimodal Healthcare Assistant**  is an educational healthcare decision-support platform that integrates medical image analysis, such as chest X-rays and scans, with clinical report analysis, such as laboratory and pathology reports, using a collaborative multi-agent architecture. The system is designed to assist users in understanding medical information and does not replace professional medical diagnosis or clinical judgment.
### Key Objectives:
- **Decision Support, Not Replacement:** The system assists patients in understanding complex diagnostic parameters and helps clinicians prioritize cases through an automated 4-tier triage system. It explicitly **does NOT** replace qualified medical professionals and never presents AI deductions as confirmed medical diagnoses.
- **Explainable Multi-Agent Workflow:** Replaces monolithic black-box prompting with 5 specialized AI agents whose timing, decisions, and data payloads can be inspected step-by-step.
- **Multimodal Synthesis:** Cross-references laboratory biochemical biomarkers against radiological visual observations.
- **Truthful Operation:** Clearly reports when an external AI API key is unconfigured and switches to a local clinical heuristic rule engine so the application works completely offline out of the box without hallucinated responses.

---

## 2. Target Users & Role-Based Access Control (RBAC)

1. **Patient / User:**
   - Upload laboratory reports (PDF, JPG, PNG, TXT) with OCR text extraction.
   - Upload medical images (X-rays, scans) with visual previews.
   - Run single-modality or multimodal analyses.
   - View structured dossiers, abnormal biomarker highlights, medical glossaries, and doctor consultation questions.
   - Converse with the context-grounded AI Healthcare Chatbot.
   - View, search, and delete personal medical history.
2. **Doctor / Clinician:**
   - Dedicated clinical portal displaying assigned patient cases and triage levels.
   - Inspect raw scans, extracted OCR text, and AI agent traces side by side.
   - Provide certified clinical verification notes and mark analyses as "Reviewed".
3. **Administrator:**
   - High-level platform statistics (users, file uploads, analyses, triage distribution).
   - User account management (activate/deactivate users).
   - Real-time subsystem health monitoring (AI API connectivity, OCR availability, disk usage).
   - Complete non-sensitive audit trail tracking.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, React Router v6, Lucide Icons, Custom Responsive Healthcare CSS Design System.
- **Backend:** Python 3.10+, Flask REST API, Flask-CORS.
- **Database & ORM:** SQLite, SQLAlchemy ORM (10 relational models).
- **Authentication & Security:** PyJWT (JSON Web Tokens), Werkzeug password hashing (PBKDF2/bcrypt), Role-based route decorators.
- **Document Processing & OCR:** Tesseract OCR (`pytesseract`) with image preprocessing + Native PDF parser (`pypdf`).
- **AI & Multimodal Reasoning:** Google Gemini 1.5 Flash API connector + Local Clinical Expert Rule Engine (biomarker parser and reference range comparator).
- **Testing:** Pytest automated test suite.

---

## 4. Multi-Agent System Architecture

```
User Request / Uploads
         │
         ▼
┌────────────────────────────────────────┐
│        Coordinator Agent               │  <-- Orchestrates inputs & execution plan
└────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Report Analysis  │  │  Image Analysis  │  <-- Specialized Modality Processing
│      Agent       │  │      Agent       │
└──────────────────┘  └──────────────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
┌────────────────────────────────────────┐
│     Medical Information Agent          │  <-- Translates jargon into plain English &
└────────────────────────────────────────┘      generates questions for the physician
                    │
                    ▼
┌────────────────────────────────────────┐
│        Risk / Triage Agent
- Educational information organizer only, not a clinical triage tool
- Classifies information urgency into Tier 1 - Tier 4 for learning purposes
- Attaches educational disclaimer and recommends professional review
- Does NOT provide diagnosis or emergency medical advice
             │  
   └────────────────────────────────────────┘   
                    │
                    ▼
┌────────────────────────────────────────┐
│        Coordinator Agent              
 │  Compiles final multimodal dossier from all agent outputs
- Ensures every response includes Medical Safety Disclaimer
- Produces Final Response Dossier
└────────────────────────────────────────┘
                    │
                    ▼
         Final Response Dossier
```

### Agent Roles:
1. **Coordinator Agent (`coordinator_agent.py`):** Coordinates modality inputs, dispatches tasks, collects step timing, handles uncertainties, and aggregates the final dossier.
2. **Report Analysis Agent (`report_analysis_agent.py`):** Analyzes clinical parameters (Hemoglobin, WBC, Platelets, Fasting Glucose, Creatinine, etc.) against reference intervals and flags abnormalities.
3. **Image Analysis Agent (`image_analysis_agent.py`):** Inspects image dimensions, contrast indices, density symmetry, anatomical landmarks, and states explicit limitations.
4. **Medical Information Agent (`medical_info_agent.py`):** Translates complex medical terms into compassionate layperson language and formulates 3–5 actionable questions to ask the doctor.
5. **Risk / Triage Agent (`risk_triage_agent.py`):** Evaluates biomarker red flags and categorizes urgency into:
   - **Tier 1 (General Information):** Normal/routine baseline.
   - **Tier 2 (Discuss with Doctor):** Mild deviations for routine appointment.
   - **Tier 3 (Prompt Medical Attention):** Notable abnormalities requiring visit within 24–48 hours.
   - **Tier 4 (Emergency Warning):** Critical indicators requiring immediate emergency attention.

---

## 5. Complete Folder Structure

```
healthcare-multimodal-assistant/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask application factory, CORS, blueprints
│   │   ├── config.py            # App settings and environment loading
│   │   ├── extensions.py        # SQLAlchemy db instance
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # User, PatientProfile, DoctorProfile
│   │   │   ├── medical_file.py  # MedicalFile, MedicalReport
│   │   │   ├── analysis.py      # Analysis, AgentResult
│   │   │   ├── chat.py          # ChatMessage
│   │   │   ├── doctor_review.py # DoctorReview
│   │   │   └── audit_log.py     # AuditLog
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── base_agent.py    # Abstract agent class with performance timing
│   │   │   ├── coordinator_agent.py
│   │   │   ├── report_analysis_agent.py
│   │   │   ├── image_analysis_agent.py
│   │   │   ├── medical_info_agent.py
│   │   │   └── risk_triage_agent.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py    # Gemini multimodal connector + clinical rule engine
│   │   │   ├── ocr_service.py   # Tesseract OCR & PDF text extraction
│   │   │   └── file_service.py  # Secure upload validation & storage
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth_routes.py   # Register, Login, Me, Profile
│   │   │   ├── upload_routes.py # Report and image uploads, secure file serving
│   │   │   ├── analysis_routes.py # Trigger multi-agent pipeline, dossiers, history
│   │   │   ├── chat_routes.py   # Context-grounded Q&A assistant
│   │   │   ├── doctor_routes.py # Doctor patient queue and clinical review sign-off
│   │   │   └── admin_routes.py  # Metrics, user management, audit logs, health
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── decorators.py    # @token_required and @role_required
│   │       ├── security.py      # JWT encoding/decoding, password hashing
│   │       └── seed_data.py     # Initial demo accounts and sample medical cases
│   ├── uploads/                 # Secure user-isolated upload storage
│   ├── tests/
│   │   ├── test_auth.py         # Registration, login, and RBAC tests
│   │   ├── test_agents.py       # 5 specialized agent unit tests
│   │   ├── test_upload.py       # File validation & upload tests
│   │   └── test_analysis.py     # End-to-end multimodal analysis & review tests
│   ├── requirements.txt
│   └── run.py                   # Backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── DisclaimerBanner.jsx
│   │   │   ├── TriageBadge.jsx
│   │   │   ├── AgentWorkflowVisualizer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx             # Page 1: Hero & overview
│   │   │   ├── AboutPage.jsx               # Page 2: Capstone documentation
│   │   │   ├── LoginPage.jsx               # Page 3: Role login with demo quick-fills
│   │   │   ├── RegisterPage.jsx            # Page 4: Dynamic patient/doctor registration
│   │   │   ├── UserDashboard.jsx           # Page 5: Patient dashboard
│   │   │   ├── UploadReportPage.jsx        # Page 6: Report upload & OCR editor
│   │   │   ├── UploadImagePage.jsx         # Page 7: Medical image upload & preview
│   │   │   ├── MultimodalAnalysisPage.jsx  # Page 8: Multi-agent execution launcher
│   │   │   ├── AnalysisResultPage.jsx      # Page 9: Comprehensive clinical dossier
│   │   │   ├── AIChatbotPage.jsx           # Page 10: Context-grounded assistant
│   │   │   ├── PatientHistoryPage.jsx      # Page 11: Patient record timeline
│   │   │   ├── ProfilePage.jsx             # Page 12: Profile & baseline health
│   │   │   ├── DoctorDashboard.jsx         # Page 13: Physician review queue
│   │   │   ├── DoctorPatientDetailsPage.jsx# Page 14: Doctor inspection & sign-off
│   │   │   ├── AdminDashboard.jsx          # Page 15: Platform metrics & user table
│   │   │   ├── SettingsPage.jsx            # Page 16: Environment & API checks
│   │   │   └── NotFoundPage.jsx            # Page 17: 404 error handler
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── uploadService.js
│   │   │   ├── analysisService.js
│   │   │   ├── chatService.js
│   │   │   ├── doctorService.js
│   │   │   └── adminService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Demonstration Credentials

The application automatically seeds realistic clinical records and demonstration accounts on its first run:

| Role | Username / Email | Password | Description |
|---|---|---|---|
| **Patient** | `patient.john@healthcare.local` | `Patient@123` | John Doe (Age 48, Male), with sample CBC & Chest X-ray analysis |
| **Doctor** | `dr.smith@healthcare.local` | `Doctor@123` | Dr. Sarah Smith, MD (Pulmonology & Internal Medicine) |
| **Admin** | `admin@healthcare.local` | `Admin@123` | System Administrator with full telemetry & governance access |

*(Quick-fill buttons are also embedded directly on the Login Page for convenience during examiner presentations).*

---

## 7. Installation & Setup Instructions (Windows)

### Prerequisites:
- **Python 3.10+** (Added to PATH)
- **Node.js 18+ and npm** (Added to PATH)
- *(Optional)* **Tesseract OCR**: Download Windows installer from [UB-Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki).

---

### Step 1: Clone or Navigate to Project Directory
```powershell
cd "C:\Users\M Windows\.gemini\antigravity\scratch\healthcare-multimodal-assistant"
```

### Step 2: Environment Configuration
Copy the `.env.example` file to `.env`:
```powershell
Copy-Item .env.example .env
```
*(Optional: Open `.env` and add your free `GEMINI_API_KEY` from Google AI Studio. If left empty, the application cleanly uses the built-in clinical expert engine).*

---

### Step 3: Backend Setup
Open PowerShell and run:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Run the backend server:
```powershell
python run.py
```
The Flask backend will initialize the SQLite database, seed the demo accounts, and listen on **`http://127.0.0.1:5000`**.

---

### Step 4: Frontend Setup
Open a second PowerShell terminal and run:
```powershell
cd "C:\Users\M Windows\.gemini\antigravity\scratch\healthcare-multimodal-assistant\frontend"
npm install
npm run dev
```
The React Vite development server will start on **`http://localhost:3000`** with proxying to the Flask backend.

---

## 8. Running Automated Tests

Run the complete backend test suite covering authentication, RBAC, file uploads, agent execution, and multimodal workflows:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pytest tests/ -v
```

---

## 9. Common Errors & Troubleshooting

1. **`TesseractNotFoundError` on scanned image reports:**
   - Install the Windows Tesseract binary from UB-Mannheim.
   - Specify the executable path in `.env`: `TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe`.
   - *Note:* Native PDF text extraction (`pypdf`) works automatically without any external binaries.
2. **`Port 5000 or 3000 already in use`:**
   - Change the port in `run.py` or `vite.config.js`, or terminate the lingering process via `Get-Process python | Stop-Process`.
3. **CORS or Network Error on API calls:**
   - Ensure the Flask backend (`python run.py`) is running before interacting with the React frontend.
   - Vite proxies all `/api` requests to `http://127.0.0.1:5000` seamlessly.

---

## 10. Medical Safety Disclaimer

> **IMPORTANT NOTICE:**
> This software is an academic engineering prototype developed for the B.Tech degree. It is provided strictly for educational, demonstration, and clinical decision-support research.
> 
> - It does **NOT** constitute medical advice or a definitive diagnosis.
> - It does **NOT** prescribe medications, establish dosages, or replace consultation with a qualified doctor.
> - Always seek the advice of a licensed physician or other qualified health provider regarding any medical condition.

