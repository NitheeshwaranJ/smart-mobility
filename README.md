# Smart Mobility Platform

**AI-Powered Car Rental & Intelligent Carpooling System**

A production-grade, recruiter-facing full-stack project that simulates a real SaaS mobility product:

- 🔐 JWT auth with role-based access (Customer / Vehicle Owner / Admin)
- 🚗 Vehicle catalog, search, booking with double-booking prevention
- 🧠 AI Dynamic Pricing Engine (demand × availability × season × popularity)
- 🤝 AI Carpooling matcher (route similarity, match %, cost & CO₂ savings)
- 💬 AI Assistant (Lovable AI Gateway / OpenAI-compatible)
- 💳 Mock payment gateway with invoice + receipt
- 📊 Admin analytics dashboard with charts
- ⭐ Reviews, notifications, trip lifecycle

## Stack

| Layer       | Tech                                                       |
| ----------- | ---------------------------------------------------------- |
| Frontend    | React 18 + Vite + TypeScript + TailwindCSS + Recharts      |
| Backend     | Python 3.11 + FastAPI + SQLAlchemy 2 + Pydantic v2         |
| Database    | MySQL 8                                                    |
| Auth        | JWT (HS256) + bcrypt                                       |
| AI          | OpenAI-compatible chat completions (works with any gateway) |
| Deploy      | Frontend → Vercel · Backend → Railway/Render · DB → Aiven/PlanetScale |

## Architecture

```
┌────────────┐    HTTPS/JSON     ┌──────────────┐    SQLAlchemy    ┌─────────┐
│  React SPA │ ─────────────────▶│ FastAPI REST │ ─────────────────▶│ MySQL 8 │
│  (Vercel)  │  Bearer JWT       │  (Railway)   │                   │ (Aiven) │
└────────────┘                   └──────┬───────┘                   └─────────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │  AI Gateway   │  (pricing, assistant)
                                │  (OpenAI API) │
                                └───────────────┘
```

## Quick start (local)

### 1. MySQL

```bash
mysql -u root -p < backend/sql/schema.sql
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # edit DB creds + JWT secret
python -m app.seed         # seeds demo users, vehicles, bookings, analytics
uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs (auto-generated OpenAPI).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:8000
npm run dev
```

App at http://localhost:5173.

## Demo accounts (seeded)

| Role     | Email                | Password  |
| -------- | -------------------- | --------- |
| Customer | recruiter@demo.com   | demo123   |
| Owner    | owner@demo.com       | demo123   |
| Admin    | admin@demo.com       | demo123   |

## Deployment → Vercel + Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

## Project structure

```
smart-mobility/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # settings via pydantic-settings
│   │   ├── database.py          # SQLAlchemy engine/session
│   │   ├── seed.py              # demo data
│   │   ├── models/              # SQLAlchemy ORM
│   │   ├── schemas/             # Pydantic request/response
│   │   ├── api/                 # REST routers
│   │   └── core/                # security, pricing, ai, carpool
│   ├── sql/schema.sql           # raw DDL
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/               # Landing, Auth, Dashboard, Vehicles, Booking, Trips, Carpool, Admin…
    │   ├── components/          # Navbar, Sidebar, Cards, Charts
    │   ├── api/                 # axios client
    │   ├── store/               # Zustand auth store
    │   └── styles.css
    └── vite.config.ts
```

## Security

- Passwords hashed with **bcrypt** (passlib)
- JWT signed with HS256, configurable expiry, secret from env
- Role checks via FastAPI dependency `require_role(...)`
- Pydantic validation on every request body
- SQLAlchemy parameterized queries (SQL-injection safe)
- CORS restricted to configured origins
- No secrets committed (`.env` git-ignored, only `.env.example`)
