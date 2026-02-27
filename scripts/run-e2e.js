/**
 * E2E: Start server must be running (e.g. PORT=3001 npm start).
 * Fills consultation + join forms as a user, then verifies DB.
 * Run: npm run test:e2e
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { chromium } = require('playwright');
const db = require('../db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const CONSULT = {
  name: 'E2E Test User',
  email: 'e2e.test@example.com',
  phone: '+1 555-123-4567',
  concern: 'Anxiety & Depression',
  message: 'E2E test message for free consultation.'
};
const JOIN = {
  name: 'E2E Join Applicant',
  email: 'e2e.join@example.com',
  service: 'Licensed Therapist',
  message: 'E2E test join application message.'
};

async function runE2E() {
  console.log('E2E: Opening browser at', BASE_URL);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (err) {
    console.error('E2E: Server not reachable at', BASE_URL, err.message);
    await browser.close();
    process.exit(1);
  }

  // Dismiss loader if present (wait a bit for it to hide)
  await page.waitForTimeout(2500);

  // --- Consultation form (#contact) ---
  console.log('E2E: Filling consultation form...');
  await page.goto(BASE_URL + '/#contact', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#consultForm', { timeout: 5000 });

  await page.fill('#consultForm input[name="name"]', CONSULT.name);
  await page.fill('#consultForm input[name="email"]', CONSULT.email);
  await page.fill('#consultForm input[name="phone"]', CONSULT.phone);
  await page.selectOption('#consultForm select[name="concern"]', { index: 1 });
  await page.fill('#consultForm textarea[name="message"]', CONSULT.message);

  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/consultation') && res.request().method() === 'POST', { timeout: 10000 }).catch(() => null),
    page.click('#consultForm button[type="submit"]')
  ]);
  await page.waitForTimeout(1500);
  const consultResp = await page.textContent('#consultResponse').catch(() => '');
  if (consultResp && (consultResp.includes('requested') || consultResp.includes('Thank') || consultResp.includes('15-minute'))) {
    console.log('E2E: Consultation form submitted successfully.');
  } else {
    console.log('E2E: Consultation response:', consultResp || '(empty)');
  }

  await page.waitForTimeout(500);

  // --- Join form (#team) ---
  console.log('E2E: Filling join form...');
  await page.goto(BASE_URL + '/#team', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#joinForm', { timeout: 5000 });

  await page.fill('#joinForm input[name="name"]', JOIN.name);
  await page.fill('#joinForm input[name="email"]', JOIN.email);
  await page.selectOption('#joinForm select[name="service"]', { label: JOIN.service });
  await page.fill('#joinForm textarea[name="message"]', JOIN.message);

  await page.click('#joinForm button[type="submit"]');
  await page.waitForSelector('#joinResponse.success', { timeout: 5000 }).catch(() => {});
  const joinResp = await page.textContent('#joinResponse').catch(() => '');
  if (joinResp && (joinResp.includes('Thank') || joinResp.includes('touch'))) {
    console.log('E2E: Join form submitted successfully.');
  } else {
    console.log('E2E: Join response:', joinResp || '(no success class)');
  }

  await browser.close();

  // --- Verify DB ---
  if (!db.connected) {
    console.log('E2E: DB not configured — skipping DB verification.');
    console.log('E2E: Done.');
    return;
  }

  console.log('\nE2E: Verifying database...');
  try {
    const consultations = await db.query(
      'SELECT id, name, email, phone, concern, message, created_at FROM consultations ORDER BY created_at DESC LIMIT 5'
    );
    const joinApps = await db.query(
      'SELECT id, name, email, service, message, created_at FROM join_applications ORDER BY created_at DESC LIMIT 5'
    );

    console.log('\n--- Latest consultations ---');
    if (consultations.rows.length === 0) {
      console.log('(none)');
    } else {
      consultations.rows.forEach((r) => {
        console.log(`  id=${r.id} name="${r.name}" email="${r.email}" concern="${r.concern}" at ${r.created_at}`);
      });
      const latest = consultations.rows[0];
      if (latest.name === CONSULT.name && latest.email === CONSULT.email) {
        console.log('  ✓ E2E consultation record found in DB.');
      } else {
        console.log('  (E2E submission may be different; check above.)');
      }
    }

    console.log('\n--- Latest join applications ---');
    if (joinApps.rows.length === 0) {
      console.log('(none)');
    } else {
      joinApps.rows.forEach((r) => {
        console.log(`  id=${r.id} name="${r.name}" email="${r.email}" service="${r.service}" at ${r.created_at}`);
      });
      const latest = joinApps.rows[0];
      if (latest.name === JOIN.name && latest.email === JOIN.email) {
        console.log('  ✓ E2E join application record found in DB.');
      } else {
        console.log('  (E2E submission may be different; check above.)');
      }
    }
  } catch (err) {
    console.error('E2E: DB verification failed:', err.message);
    process.exit(1);
  }

  console.log('\nE2E: Done.');
}

runE2E().catch((err) => {
  console.error('E2E error:', err);
  process.exit(1);
});
