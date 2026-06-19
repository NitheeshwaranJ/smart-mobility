# Deployment Guide

This project deploys cleanly across three free-tier services:

| Component | Service             | Free tier |
| --------- | ------------------- | --------- |
| Frontend  | **Vercel**          | Yes       |
| Backend   | **Railway** (or Render) | Yes |
| Database  | **Aiven for MySQL** (or PlanetScale) | Yes |

---

## 1. Database — Aiven MySQL

1. Create a free MySQL service at https://aiven.io.
2. Once provisioned, copy the connection URI (`mysql://user:pass@host:port/defaultdb`).
3. From your local machine, load the schema:
   ```bash
   mysql -h <host> -P <port> -u <user> -p<password> defaultdb < backend/sql/schema.sql
   ```
4. Seed demo data (run once):
   ```bash
   cd backend
   DATABASE_URL='mysql+pymysql://user:pass@host:port/defaultdb' python -m app.seed
   ```

---

## 2. Backend — Railway

1. Push the repo to GitHub.
2. https://railway.app → **New Project → Deploy from GitHub** → pick the repo.
3. Set **Root Directory** = `smart-mobility/backend`.
4. Railway auto-detects Python. Build command:
   ```
   pip install -r requirements.txt
   ```
   Start command:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add environment variables:
   ```
   DATABASE_URL=mysql+pymysql://user:pass@host:port/defaultdb
   JWT_SECRET=<generate a long random string>
   JWT_EXPIRES_MIN=1440
   CORS_ORIGINS=https://<your-vercel-app>.vercel.app
   OPENAI_API_KEY=<optional — enables AI assistant>
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4o-mini
   ```
6. Deploy. Copy the public URL (e.g. `https://smart-mobility-backend.up.railway.app`).

---

## 3. Frontend — Vercel

1. https://vercel.com → **Add New Project** → import the GitHub repo.
2. **Root Directory** = `smart-mobility/frontend`.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Environment variable:
   ```
   VITE_API_URL=https://smart-mobility-backend.up.railway.app
   ```
5. Deploy. Open your `https://<app>.vercel.app` → log in with
   `recruiter@demo.com / demo123`.

---

## 4. Post-deploy checklist

- [ ] Backend `GET /health` returns `{"status":"ok"}`
- [ ] `GET /docs` shows the OpenAPI UI
- [ ] Frontend login works with demo accounts
- [ ] Vehicle search returns seeded vehicles
- [ ] Admin dashboard charts populated
- [ ] Update `CORS_ORIGINS` on backend after Vercel domain is final

---

## Alternative: Render

Backend works identically on Render (Web Service, Python env). Same start command, same env vars.
