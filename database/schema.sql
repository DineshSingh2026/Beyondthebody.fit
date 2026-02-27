-- Beyond The Body — PostgreSQL Schema
-- Run as superuser or DB owner: psql -U postgres -f database/schema.sql

-- Create database (run separately if needed: CREATE DATABASE beyond_the_body;)
-- \connect beyond_the_body;

-- ===================== CONSULTATION REQUESTS (Free consultation form) =====================
CREATE TABLE IF NOT EXISTS consultations (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(50),
  concern        VARCHAR(255),
  message        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== CONTACT / JOIN APPLICATIONS (Join the team form) =====================
CREATE TABLE IF NOT EXISTS join_applications (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  service        VARCHAR(255),
  message        TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== CONDITIONS (Anxiety, Depression, etc.) =====================
CREATE TABLE IF NOT EXISTS conditions (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL UNIQUE,
  fact           VARCHAR(500) NOT NULL,
  treatment      VARCHAR(255) NOT NULL,
  color          VARCHAR(20) NOT NULL DEFAULT '#4CAF50'
);

CREATE TABLE IF NOT EXISTS condition_signs (
  id             SERIAL PRIMARY KEY,
  condition_id   INT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  text           VARCHAR(500) NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS condition_treatments (
  id             SERIAL PRIMARY KEY,
  condition_id   INT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  text           VARCHAR(500) NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0
);

-- ===================== AFFIRMATIONS =====================
CREATE TABLE IF NOT EXISTS affirmations (
  id             SERIAL PRIMARY KEY,
  text           TEXT NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0
);

-- ===================== BRAIN TIPS =====================
CREATE TABLE IF NOT EXISTS brain_tips (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT NOT NULL,
  category       VARCHAR(100) NOT NULL,
  icon           VARCHAR(20) NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0
);

-- ===================== QUOTES =====================
CREATE TABLE IF NOT EXISTS quotes (
  id             SERIAL PRIMARY KEY,
  quote_text     TEXT NOT NULL,
  author         VARCHAR(255) NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0
);

-- ===================== SERVICES (Licensed Therapists, etc.) =====================
CREATE TABLE IF NOT EXISTS services (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  icon           VARCHAR(20),
  badge          VARCHAR(100),
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_items (
  id             SERIAL PRIMARY KEY,
  service_id     INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  text           VARCHAR(255) NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_join_applications_created_at ON join_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_condition_signs_condition_id ON condition_signs(condition_id);
CREATE INDEX IF NOT EXISTS idx_condition_treatments_condition_id ON condition_treatments(condition_id);
CREATE INDEX IF NOT EXISTS idx_service_items_service_id ON service_items(service_id);
