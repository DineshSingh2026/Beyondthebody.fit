/**
 * Check API and DB: health, GET endpoints, POST forms, then verify DB.
 * Usage: node scripts/check-api-db.js [baseUrl]
 * Example: node scripts/check-api-db.js http://localhost:3001
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

const BASE = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
let failed = 0;

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

async function run() {
  console.log('Checking API and DB at', BASE, '\n');

  // 1. Health
  try {
    const health = await get('/api/health');
    console.log('GET /api/health:', health.db === 'connected' ? 'OK (DB connected)' : health.db || health);
    if (health.db === 'error') failed++;
  } catch (e) {
    console.log('GET /api/health: FAIL', e.message);
    failed++;
  }

  // 2. GET endpoints
  for (const path of ['/api/affirmations', '/api/conditions', '/api/brain-tips', '/api/quotes', '/api/services']) {
    try {
      const data = await get(path);
      const len = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
      console.log('GET', path, 'OK', Array.isArray(data) ? `(${data.length} items)` : '');
    } catch (e) {
      console.log('GET', path, 'FAIL', e.message);
      failed++;
    }
  }

  // 3. POST consultation
  try {
    const consultRes = await post('/api/consultation', {
      name: 'Check User',
      email: 'check@example.com',
      phone: '555-0000',
      concern: 'Stress & Burnout',
      message: 'API/DB check test.'
    });
    if (consultRes.success) console.log('POST /api/consultation: OK');
    else {
      console.log('POST /api/consultation: FAIL', consultRes.message);
      failed++;
    }
  } catch (e) {
    console.log('POST /api/consultation: FAIL', e.message);
    failed++;
  }

  // 4. POST contact/join
  try {
    const contactRes = await post('/api/contact', {
      name: 'Check Join',
      email: 'check-join@example.com',
      service: 'Trauma Specialist',
      message: 'API/DB check join test.'
    });
    if (contactRes.success) console.log('POST /api/contact: OK');
    else {
      console.log('POST /api/contact: FAIL', contactRes.message);
      failed++;
    }
  } catch (e) {
    console.log('POST /api/contact: FAIL', e.message);
    failed++;
  }

  // 5. DB verification
  if (db.connected) {
    try {
      const c = await db.query('SELECT id, name, email FROM consultations ORDER BY created_at DESC LIMIT 1');
      const j = await db.query('SELECT id, name, email FROM join_applications ORDER BY created_at DESC LIMIT 1');
      console.log('\nDB consultations latest:', c.rows[0] ? `${c.rows[0].name} (${c.rows[0].email})` : 'none');
      console.log('DB join_applications latest:', j.rows[0] ? `${j.rows[0].name} (${j.rows[0].email})` : 'none');
      console.log('DB connection: OK');
    } catch (e) {
      console.log('DB query: FAIL', e.message);
      failed++;
    }
  } else {
    console.log('\nDB: not configured (skipped)');
  }

  console.log('\n' + (failed ? `Done with ${failed} failure(s).` : 'All checks passed.'));
  process.exit(failed ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
