/**
 * PostgreSQL connection for Beyond The Body.
 * If DATABASE_URL (or PG env vars) are not set, db.connected is false and server falls back to in-memory.
 */
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL ||
  (process.env.PGHOST && process.env.PGDATABASE
    ? `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`
    : null);

const pool = connectionString
  ? new Pool({ connectionString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false })
  : null;

const db = {
  connected: !!pool,
  query: (text, params) => pool ? pool.query(text, params) : Promise.reject(new Error('DB not configured')),
  pool
};

module.exports = db;
