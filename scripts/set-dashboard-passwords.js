/**
 * Set unique passwords for the single Admin (id 1) and single Therapist (id 2).
 * Run after seed-dashboard.sql. Uses bcrypt.
 *
 * Credentials:
 *   Admin:    admin@beyondthebody.fit  /  Admin@BTB2026
 *   Therapist: sarah@btb.fit          /  Therapist@BTB2026
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@BTB2026';
const THERAPIST_PASSWORD = process.env.THERAPIST_PASSWORD || 'Therapist@BTB2026';

async function main() {
  if (!db.connected) {
    console.error('Database not configured. Set DATABASE_URL.');
    process.exit(1);
  }
  try {
    const [adminHash, therapistHash] = await Promise.all([
      bcrypt.hash(ADMIN_PASSWORD, 10),
      bcrypt.hash(THERAPIST_PASSWORD, 10),
    ]);
    await db.query('UPDATE dashboard_users SET password_hash = $1 WHERE id = 1', [adminHash]);
    await db.query('UPDATE dashboard_users SET password_hash = $1 WHERE id = 2', [therapistHash]);
    console.log('Set passwords for Admin (id 1) and Therapist (id 2).');
    console.log('  Admin:    admin@beyondthebody.fit  /  (use ADMIN_PASSWORD or default)');
    console.log('  Therapist: sarah@btb.fit          /  (use THERAPIST_PASSWORD or default)');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (db.pool) db.pool.end();
  }
}

main();
