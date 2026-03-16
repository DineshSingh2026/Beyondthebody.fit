# Deploy Beyond The Body on Render (NestJS + Next.js)

## Option 1: Deploy with Blueprint (recommended)

The repo uses a **two-service** setup: **Backend (NestJS)** and **Frontend (Next.js)**.

### Step 1: Deploy with Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com) → **Blueprints** → **New Blueprint Instance**.
2. Connect your GitHub account and select the repo **DineshSingh2026/Beyondthebody.fit** (and branch, e.g. `main`).
3. Render will detect `render.yaml` in the root. Review and click **Apply**.
4. Render creates:
   - **PostgreSQL** database: `beyond-the-body-db`
   - **Web Service (Backend):** `beyond-the-body-api` — NestJS API, root `backend/`
   - **Web Service (Frontend):** `beyond-the-body` — Next.js app, root `frontend/`

5. Wait for both services to finish their **first deploy**. Note the URLs, e.g.:
   - Backend: `https://beyond-the-body-api.onrender.com`
   - Frontend: `https://beyond-the-body.onrender.com`

### Step 2: Set environment variables (required)

**Backend service (`beyond-the-body-api`):**

1. Open the service → **Environment**.
2. Set **FRONTEND_URL** to your frontend URL (no trailing slash):
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://beyond-the-body.onrender.com`
3. Save. Render will redeploy the backend.

**Frontend service (`beyond-the-body`):**

1. Open the service → **Environment**.
2. Set **NEXT_PUBLIC_API_URL** to your backend URL (no trailing slash):
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://beyond-the-body-api.onrender.com`
3. Save, then **Manual Deploy** → **Deploy latest commit** (so the build uses the new value).

**If login shows "Failed to fetch":** The frontend cannot reach the backend. Set **NEXT_PUBLIC_API_URL** to your backend URL (e.g. `https://api.beyondthebody.fit` or `https://beyond-the-body-api.onrender.com`), then trigger a **Manual Deploy** on the frontend (required—this env is baked in at build time).

### Step 3: Initialize the database (once)

1. Open the **Backend** service (`beyond-the-body-api`) → **Shell**.
2. Run from repo root:
   ```bash
   node scripts/init-db.js
   ```
   If the shell opens in `backend/`, run:
   ```bash
   node ../scripts/init-db.js
   ```
3. Wait for "Database setup complete."

### Step 4: You’re done

- **App (frontend):** https://beyond-the-body.onrender.com  
- **API (backend):** https://beyond-the-body-api.onrender.com  

---

## Option 2: Manual setup (without Blueprint)

### 1. Create PostgreSQL

- **Dashboard** → **New +** → **PostgreSQL**. Name: `beyond-the-body-db`, Plan: Free. Copy **Internal Database URL**.

### 2. Backend service

- **New +** → **Web Service**. Connect repo, branch.
- **Name:** `beyond-the-body-api` | **Root Directory:** `backend`
- **Build:** `npm install && npm run build` | **Start:** `npm run start`
- **Environment:** `NODE_ENV` = `production`, `DATABASE_URL` = (Internal DB URL), `FRONTEND_URL` = (frontend URL after Step 3)
- **Health Check Path:** `/api/health`

### 3. Frontend service

- **New +** → **Web Service**. Same repo, branch.
- **Name:** `beyond-the-body` | **Root Directory:** `frontend`
- **Build:** `npm install && npm run build` | **Start:** `npm run start`
- **Environment:** `NEXT_PUBLIC_API_URL` = `https://beyond-the-body-api.onrender.com`

### 4. Init DB

- Backend service → **Shell** → `node scripts/init-db.js` (or `node ../scripts/init-db.js` from `backend/`).

---

## Notes

- **Free tier:** Services may spin down after inactivity; first request can be slow (cold start).
- **Secrets:** Never commit `.env`. Use Render **Environment** for all secrets.
- **Custom domain:** In each Web Service → **Settings** → **Custom Domains** you can add e.g. `beyondthebody.fit` (frontend) and `api.beyondthebody.fit` (backend); then update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` to match.
