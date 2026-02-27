# Beyond The Body — PostgreSQL

## 1. Create the database

From a terminal (PostgreSQL installed):

```bash
# Option A: run the script
psql -U postgres -f database/create-database.sql

# Option B: one-liner
psql -U postgres -c "CREATE DATABASE beyond_the_body;"
```

Or in `psql`: `CREATE DATABASE beyond_the_body;` then `\q`

## 2. Run schema (tables)

```bash
psql -U postgres -d beyond_the_body -f database/schema.sql
```

## 3. Seed content data

```bash
psql -U postgres -d beyond_the_body -f database/seed.sql
```

## 4. Environment

Set connection string for the Node app (optional; defaults below):

- **Windows:** System env or `.env` file: `DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/beyond_the_body`
- Or use: `PGUSER`, `PGHOST`, `PGPORT`, `PGPASSWORD`, `PGDATABASE`

Example `.env` in project root:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/beyond_the_body
```

## Tables

| Table | Purpose |
|-------|---------|
| `consultations` | Free consultation form (name, email, phone, concern, message) |
| `join_applications` | Join the team form (name, email, service, message) |
| `conditions` | Anxiety, Depression, Trauma, Stress (name, fact, treatment, color) |
| `condition_signs` | Per-condition signs (one row per sign) |
| `condition_treatments` | Per-condition treatments (one row per treatment) |
| `affirmations` | Affirmation text for hero & carousel |
| `brain_tips` | Brain tips cards (title, description, category, icon) |
| `quotes` | Quote cards (quote_text, author) |
| `services` | Service titles (Licensed Therapists, etc.) |
| `service_items` | Bullet points per service |
