/**
 * Creates beyond_the_body DB (if missing), runs schema.sql and seed.sql.
 * Usage: node scripts/init-db.js
 * Requires: DATABASE_URL in .env (or set PGHOST, PGDATABASE, PGUSER, PGPASSWORD)
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

// URL to connect to default 'postgres' DB to create our database
const postgresUrl = dbUrl.replace(/\/([^/?]+)(\?.*)?$/, '/postgres$2');
const dbName = 'beyond_the_body';

async function run() {
  // Step 1 (optional): Create beyond_the_body DB if running locally against postgres. Skip on Render (DB already exists).
  const admin = new Client({ connectionString: postgresUrl });
  try {
    await admin.connect();
    await admin.query(`CREATE DATABASE ${dbName}`).catch((err) => {
      if (err.code !== '42P04') throw err; // 42P04 = already exists
      console.log('Database beyond_the_body already exists.');
    });
    await admin.end();
  } catch (err) {
    await admin.end().catch(() => {});
    console.log('Skip create-database (use existing DB):', err.message);
  }

  // Step 2: Connect and run schema + seed
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to beyond_the_body.');
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  const schemaDashboardPath = path.join(__dirname, '..', 'database', 'schema-dashboard.sql');
  const seedDashboardPath = path.join(__dirname, '..', 'database', 'seed-dashboard.sql');

  for (const [label, filePath] of [
    ['schema', schemaPath],
    ['seed', seedPath],
    ['schema-dashboard', schemaDashboardPath],
    ['seed-dashboard', seedDashboardPath],
  ]) {
    if (!fs.existsSync(filePath)) {
      console.log(`Skip ${label}: file not found`);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await client.query(sql);
      console.log(`Ran ${label}.sql successfully.`);
    } catch (err) {
      console.error(`Error running ${label}.sql:`, err.message);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('Database setup complete.');

  // Set admin and therapist passwords (safe to run multiple times)
  console.log('Setting admin/therapist passwords...');
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/set-dashboard-passwords.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (err) {
    console.warn('Password seeding skipped:', err.message);
  }
}

run();
