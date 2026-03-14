# Beyond The Body — Dashboard + PostgreSQL

## Database (PostgreSQL)

- **Password:** `Dinesh@2026` (in connection URL use `Dinesh%402026`)
- **Database:** `beyond_the_body`
- **Setup:** From project root run:
  ```bash
  # Ensure .env has DATABASE_URL=postgresql://postgres:Dinesh%402026@localhost:5432/beyond_the_body
  node scripts/init-db.js
  ```
  This runs `schema.sql`, `seed.sql`, `schema-dashboard.sql`, and `seed-dashboard.sql`.

## Running the stack (all data working)

1. **Start PostgreSQL** (if not already running).

2. **Start the API server** (Express + pg):
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:3000 (or next free port). You should see: `PostgreSQL: connected`.

3. **Start the Next.js frontend:**
   ```bash
   cd frontend && npm run dev
   ```
   Frontend runs on http://localhost:3001 (or 3002, 3003 if 3000 is in use).

4. **Open dashboards:**
   - User: http://localhost:3001/dashboard/user (user id 6 = Alex Rivera)
   - Admin: http://localhost:3001/dashboard/admin
   - Therapist: http://localhost:3001/dashboard/therapist (specialist id 2 = Dr. Sarah Chen)

## API → Frontend

- Frontend calls `NEXT_PUBLIC_API_URL` or `http://localhost:3000` for all API requests.
- If the API is down or returns an error, dashboards fall back to mock data so the UI still works.
- **User dashboard:** `GET /api/users/6/dashboard` — healing score, stats, sessions, specialists, mood, milestones, community feed.
- **Admin:** `GET /api/admin/platform-stats`, `/api/admin/applications`, etc. Approve/Reject applications via `PATCH /api/admin/applications/:id`.
- **Therapist:** `GET /api/specialists/2/dashboard` — today’s schedule, clients, notes, requests, reviews, earnings.
- **Mood:** `GET /api/users/6/mood-log`, `POST /api/users/6/mood-log` (date, value 1–10, optional note).

## Seed data (after init-db.js)

- **Users:** Admin (1), Dr. Sarah Chen (2), James Miller (3), Maya Foster (4), Leo Torres (5), Alex Rivera (6), Jordan Kim (7), Sam Taylor (8).
- **User 6 (Alex)** has healing score 72, upcoming sessions with specialists 2 and 3, mood log (14 days), milestones, and is linked to specialists 2, 3, 4.
- **Specialist applications** for admin to approve/reject.
- **Sessions, session notes, booking requests, reviews** for therapist 2.

All dashboard fields are wired to this data and stay in sync when you use the app (e.g. approve application, log mood).
