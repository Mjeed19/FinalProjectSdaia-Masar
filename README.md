# مسار (Masar) — AI & Data Career Intelligence Platform

منصة ذكاء مهني تفاعلية لتحليل رواتب ووظائف الذكاء الاصطناعي وعلوم البيانات.

---

## Project Overview

Masar transforms 105,000+ real job and salary records (2020–2025) into an interactive career intelligence dashboard. It helps users explore salaries, compare careers, find their best-fit role, and ask an AI assistant powered by real data.

**Target Users:** AI/Data professionals and students in Saudi Arabia exploring career options.

**Problem Statement:** Career decisions in AI/Data are made without reliable, structured salary and market data — especially in the Saudi context.

---

## Project Structure

```
masar/
├── backend/
│   ├── main.py              # FastAPI app — all API endpoints
│   ├── salaries.csv         # Dataset (105,434 records)
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Jobs, Salaries, Experience, Remote, Countries, Compare, CareerMatch, AICoach
│   │   ├── components/      # Layout, KpiCard, Loading, ErrorBox, SourceNote, SectionTitle
│   │   ├── lib/api.js       # API client
│   │   └── App.jsx          # Routes
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
├── AGENTS.md                # AI engineering rules
└── SECURITY_RULES.md        # Security guidelines
```

---

## Technologies & AI Tools Used

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, Uvicorn |
| Frontend | React, Vite, Tailwind CSS, Recharts |
| AI API | OpenRouter → openai/gpt-4o-mini |
| Dataset | Kaggle — Data Science Salaries 2025 (105K records) |
| Deployment | Render (backend: Web Service, frontend: Static Site) |
| AI Dev Tool | Claude (Anthropic) |

---

## Installation & Run Instructions

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at: `http://localhost:8000`
Health check: `http://localhost:8000/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard runs at: `http://localhost:5173`

### Environment Variables

Create `backend/.env` (never commit this file):
```
OPENROUTER_API_KEY=sk-or-v1-...
```

For production frontend, set in Render:
```
VITE_API_URL=https://your-api.onrender.com/api
```

---

## How to Use the Application

1. **Dashboard** — Overview KPIs: median salary, top roles, remote work %, Saudi context.
2. **الوظائف (Jobs)** — Browse and search all job titles. Click any to see full detail.
3. **الرواتب (Salaries)** — Filter by title, experience, company size, work style. See salary distribution histogram.
4. **الخبرة (Experience)** — Salary growth from Entry → Executive level.
5. **عن بُعد (Remote)** — On-site vs Hybrid vs Fully Remote salary comparison.
6. **الدول (Countries)** — Top countries by company location or employee residence.
7. **مقارنة (Compare)** — Side-by-side comparison of two job titles.
8. **مسارك المهني (Career Match)** — Fill a short profile → get a scored list of best-fit careers.
9. **المساعد الذكي (AI Coach)** — Ask any career question in Arabic or English.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Main KPIs |
| GET | `/api/dashboard/highest-paying` | Top paying roles |
| GET | `/api/dashboard/experience` | Salary by experience |
| GET | `/api/dashboard/remote` | Salary by remote type |
| GET | `/api/dashboard/countries` | Salary by country |
| GET | `/api/dashboard/saudi` | Saudi-specific data |
| GET | `/api/jobs` | Job list + filters + distribution |
| GET | `/api/jobs/{title}` | Job detail |
| GET | `/api/compare?a=X&b=Y` | Compare two jobs |
| POST | `/api/career-match` | Career scoring |
| POST | `/api/chat` | AI assistant |

---

## Future Improvements

- Add Saudi-specific salary data from local job boards and government sources (MCIT, SDAIA).
- User accounts to save career profiles, comparisons, and chat history.
- 2026–2035 salary forecasting with documented statistical methodology.
- Live job scraping from Saudi job platforms.
- CV analysis and job-CV matching.
- Mobile app (React Native).
- Learning roadmap per recommended career path.

---

## Data Disclaimer

The dataset is a global Kaggle dataset and is **not** representative of the Saudi Arabia labor market unless explicitly filtered for SA records. All metrics are clearly labeled by source.
