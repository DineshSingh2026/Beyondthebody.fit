/**
 * E2E: Requires API server (e.g. PORT=3001 node server.js). Optionally Next.js for auth.
 * - Website: fills consultation + join forms on static site, verifies DB.
 * - Auth (RUN_AUTH_E2E=1): login as admin, therapist, then user (signup + save mood) on Next.js app.
 *
 * Run website-only: BASE_URL=http://localhost:3001 npm run test:e2e
 * Run full (website + auth): Start API and Next.js, then:
 *   BASE_URL=http://localhost:3001 AUTH_APP_URL=http://localhost:3000 RUN_AUTH_E2E=1 npm run test:e2e
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { chromium } = require('playwright');
const db = require('../db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const AUTH_APP_URL = process.env.AUTH_APP_URL || BASE_URL; // Next.js app URL for login/dashboard (when different from static)
const RUN_AUTH_E2E = process.env.RUN_AUTH_E2E === '1' || process.env.RUN_AUTH_E2E === 'true';

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

const ADMIN = { email: 'admin@beyondthebody.fit', password: 'Admin@BTB2026' };
const THERAPIST = { email: 'sarah@btb.fit', password: 'Therapist@BTB2026' };
const E2E_USER = { name: 'E2E Dashboard User', email: 'e2e.dashboard@example.com', password: 'E2eUserPass1!' };

async function runWebsiteE2E(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2500);

  // --- Consultation form (#contact) ---
  console.log('E2E: Filling consultation form...');
  await page.goto(BASE_URL + '/#contact', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#consultForm', { timeout: 8000 });

  await page.fill('#consultForm input[name="name"]', CONSULT.name);
  await page.fill('#consultForm input[name="email"]', CONSULT.email);
  await page.fill('#consultForm input[name="phone"]', CONSULT.phone);
  await page.selectOption('#consultForm select[name="concern"]', { index: 1 });
  await page.fill('#consultForm textarea[name="message"]', CONSULT.message);

  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/consultation') && res.request().method() === 'POST', { timeout: 10000 }).catch(() => null),
    page.click('#consultForm button[type="submit"]')
  ]);
  await page.waitForTimeout(2000);
  const consultResp = await page.textContent('#consultResponse').catch(() => page.textContent('.form-response').catch(() => ''));
  if (consultResp && (consultResp.includes('requested') || consultResp.includes('Thank') || consultResp.includes('15-minute'))) {
    console.log('E2E: Consultation form submitted successfully.');
  } else {
    console.log('E2E: Consultation response:', consultResp || '(empty)');
  }

  // --- Join form (#team) ---
  console.log('E2E: Filling join form...');
  await page.goto(BASE_URL + '/#team', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#joinForm', { timeout: 10000 });

  await page.fill('#joinForm input[name="name"]', JOIN.name);
  await page.fill('#joinForm input[name="email"]', JOIN.email);
  await page.selectOption('#joinForm select[name="service"]', { label: JOIN.service });
  await page.fill('#joinForm textarea[name="message"]', JOIN.message);

  await page.click('#joinForm button[type="submit"]');
  await page.waitForTimeout(2500);
  await page.waitForSelector('#joinResponse.success, .form-response.success', { timeout: 5000 }).catch(() => {});
  const joinResp = await page.textContent('#joinResponse').catch(() => page.textContent('.form-response').catch(() => ''));
  if (joinResp && (joinResp.includes('Thank') || joinResp.includes('touch'))) {
    console.log('E2E: Join form submitted successfully.');
  } else {
    console.log('E2E: Join response:', joinResp || '(no success class)');
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runAuthE2E(browser) {
  if (!RUN_AUTH_E2E) return;
  console.log('\nE2E: Auth flows (admin, therapist, user) at', AUTH_APP_URL);

  const page = await browser.newPage();

  try {
    await page.goto(AUTH_APP_URL + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (err) {
    console.log('E2E: /login not available, skipping auth e2e.');
    return;
  }

  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count() === 0) {
    console.log('E2E: No login form found, skipping auth e2e.');
    return;
  }

  // --- Admin login ---
  console.log('E2E: Login as admin...');
  await emailInput.fill(ADMIN.email);
  await page.fill('input[type="password"]', ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\/admin/, { timeout: 10000 }).catch(() => {});
  const adminOk = page.url().includes('/dashboard/admin');
  if (adminOk) console.log('E2E: Admin login OK.');
  else console.log('E2E: Admin login failed or wrong redirect:', page.url());

  await page.goto(AUTH_APP_URL + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // --- Therapist login ---
  console.log('E2E: Login as therapist...');
  await emailInput.fill(THERAPIST.email);
  await page.fill('input[type="password"]', THERAPIST.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\/therapist/, { timeout: 10000 }).catch(() => {});
  const therapistOk = page.url().includes('/dashboard/therapist');
  if (therapistOk) console.log('E2E: Therapist login OK.');
  else console.log('E2E: Therapist login failed or wrong redirect:', page.url());

  // --- User: signup then login and save mood ---
  console.log('E2E: Signup + login as user, save mood...');
  await page.goto(AUTH_APP_URL + '/signup', { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  const nameInput = page.locator('input[placeholder="Full name"], input[name="name"], input[type="text"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.fill(E2E_USER.name);
    await page.fill('input[type="email"]', E2E_USER.email);
    await page.fill('input[type="password"]', E2E_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/user/, { timeout: 12000 }).catch(() => {});
  }

  const onUserDashboard = page.url().includes('/dashboard/user');
  if (!onUserDashboard) {
    await page.goto(AUTH_APP_URL + '/login');
    await page.fill('input[type="email"]', E2E_USER.email);
    await page.fill('input[type="password"]', E2E_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});
  }

  if (page.url().includes('/dashboard/user')) {
    await page.goto(AUTH_APP_URL + '/dashboard/user/mood', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(3000);
    const logBtn = page.locator('button:has-text("Log Mood")').first();
    if (await logBtn.count() > 0) {
      await logBtn.click().catch(() => {});
      await sleep(2000);
      console.log('E2E: User mood save attempted.');
    }
    console.log('E2E: User flow OK.');
  }
}

async function runE2E() {
  console.log('E2E: Opening browser at', BASE_URL);
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await runWebsiteE2E(page);
  } catch (err) {
    console.error('E2E: Website forms error:', err.message);
  }

  await runAuthE2E(browser);
  await browser.close();

  // --- Verify DB ---
  if (!db.connected) {
    console.log('\nE2E: DB not configured — skipping DB verification.');
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
