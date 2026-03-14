require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_SECRET = process.env.AUTH_SECRET || 'btb-dev-secret-change-in-production';

function createToken(payload) {
  const data = JSON.stringify({ id: payload.id, role: payload.role, email: payload.email });
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, sig })).toString('base64url');
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const raw = JSON.parse(Buffer.from(token, 'base64url').toString());
    const sig = crypto.createHmac('sha256', AUTH_SECRET).update(raw.data).digest('hex');
    if (sig !== raw.sig) return null;
    return JSON.parse(raw.data);
  } catch {
    return null;
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// ---------- In-memory fallback when DB not configured ----------
const fallbackAffirmations = [
  "I choose to prioritize my mental wellness alongside my physical health.",
  "I am worthy of healing, growth, and unconditional love.",
  "Every day I move beyond limitations and discover my true potential.",
  "My mind and body work in harmony to support my wellbeing.",
  "I embrace the journey of healing with courage and compassion.",
  "I deserve peace, joy, and a life that feels aligned with my soul.",
  "Healing is not linear, and I honor every step of my journey.",
  "I release what no longer serves me and welcome transformation.",
  "My mental health matters and I invest in it every single day.",
  "I am beyond my struggles. I am resilient, strong, and capable."
];

const fallbackConditions = [
  { name: "Anxiety", fact: "Affects 40 million adults annually", treatment: "80-90% success rate", signs: ["Racing thoughts & constant worry", "Physical symptoms (heart racing, sweating)", "Avoidance of situations or activities", "Difficulty concentrating"], treatments: ["Cognitive Behavioral Therapy (CBT)", "Exposure Response Prevention", "Mindfulness-based interventions", "Medication when appropriate"], color: "#7B4FBE" },
  { name: "Depression", fact: "17+ million adults experience this annually", treatment: "70-80% recovery with treatment", signs: ["Persistent sadness or emptiness", "Loss of interest in activities", "Changes in sleep/appetite", "Thoughts of worthlessness"], treatments: ["Individual therapy (CBT, IPT, DBT)", "Lifestyle interventions", "Support group therapy"], color: "#C2185B" },
  { name: "Trauma & PTSD", fact: "70% of adults experience trauma in lifetime", treatment: "85% improvement with trauma-informed care", signs: ["Intrusive memories or flashbacks", "Avoidance of trauma reminders", "Hypervigilance or easily startled", "Negative changes in thoughts/mood"], treatments: ["EMDR Therapy", "Trauma-Focused CBT", "Somatic therapy approaches", "Group trauma recovery"], color: "#1565C0" },
  { name: "Stress & Burnout", fact: "77% experience physical stress symptoms", treatment: "94% recovery rate with proper support", signs: ["Emotional exhaustion", "Cynicism about work/life", "Reduced sense of accomplishment", "Physical symptoms (headaches, insomnia)"], treatments: ["Stress reduction techniques", "Boundary setting strategies", "Work-life balance coaching", "Mindfulness & relaxation training"], color: "#2E7D32" }
];

const fallbackBrainTips = [
  { title: "Box Breathing", description: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.", category: "Anxiety Relief", icon: "🫁" },
  { title: "5-4-3-2-1 Grounding", description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.", category: "Grounding", icon: "🌿" },
  { title: "Cognitive Reframing", description: "Ask: Is this thought 100% true? What would I tell a friend in this situation?", category: "Mental Clarity", icon: "🧠" },
  { title: "Progressive Relaxation", description: "Tense each muscle group for 5 seconds, then release. Start from your toes.", category: "Stress Relief", icon: "💪" },
  { title: "Body Scan Meditation", description: "Close your eyes and scan from head to toe, releasing tension you find.", category: "Mindfulness", icon: "✨" },
  { title: "Journaling Reset", description: "Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.", category: "Emotional Health", icon: "📝" }
];

// ---------- API: Affirmations ----------
app.get('/api/affirmations', async (req, res) => {
  if (!db.connected) return res.json(fallbackAffirmations);
  try {
    const r = await db.query('SELECT text FROM affirmations ORDER BY sort_order, id');
    res.json(r.rows.map(row => row.text));
  } catch (err) {
    console.error('GET /api/affirmations', err);
    res.json(fallbackAffirmations);
  }
});

// ---------- API: Brain tips ----------
app.get('/api/brain-tips', async (req, res) => {
  if (!db.connected) return res.json(fallbackBrainTips);
  try {
    const r = await db.query('SELECT title, description, category, icon FROM brain_tips ORDER BY sort_order, id');
    res.json(r.rows);
  } catch (err) {
    console.error('GET /api/brain-tips', err);
    res.json(fallbackBrainTips);
  }
});

// ---------- API: Conditions ----------
app.get('/api/conditions', async (req, res) => {
  if (!db.connected) return res.json(fallbackConditions);
  try {
    const conds = await db.query('SELECT id, name, fact, treatment, color FROM conditions ORDER BY id');
    const result = [];
    for (const c of conds.rows) {
      const signs = await db.query('SELECT text FROM condition_signs WHERE condition_id = $1 ORDER BY sort_order, id', [c.id]);
      const treatments = await db.query('SELECT text FROM condition_treatments WHERE condition_id = $1 ORDER BY sort_order, id', [c.id]);
      result.push({
        name: c.name,
        fact: c.fact,
        treatment: c.treatment,
        color: c.color,
        signs: signs.rows.map(r => r.text),
        treatments: treatments.rows.map(r => r.text)
      });
    }
    res.json(result);
  } catch (err) {
    console.error('GET /api/conditions', err);
    res.json(fallbackConditions);
  }
});

// ---------- API: Quotes (optional for future use) ----------
app.get('/api/quotes', async (req, res) => {
  if (!db.connected) return res.json([]);
  try {
    const r = await db.query('SELECT quote_text, author FROM quotes ORDER BY sort_order, id');
    res.json(r.rows.map(row => ({ quote_text: row.quote_text, author: row.author })));
  } catch (err) {
    console.error('GET /api/quotes', err);
    res.json([]);
  }
});

// ---------- API: Services (optional for future use) ----------
app.get('/api/services', async (req, res) => {
  if (!db.connected) return res.json([]);
  try {
    const svc = await db.query('SELECT id, title, icon, badge, is_featured FROM services ORDER BY sort_order, id');
    const result = [];
    for (const s of svc.rows) {
      const items = await db.query('SELECT text FROM service_items WHERE service_id = $1 ORDER BY sort_order, id', [s.id]);
      result.push({
        title: s.title,
        icon: s.icon,
        badge: s.badge,
        is_featured: s.is_featured,
        items: items.rows.map(r => r.text)
      });
    }
    res.json(result);
  } catch (err) {
    console.error('GET /api/services', err);
    res.json([]);
  }
});

// ---------- POST: Specialist / therapist applications → specialist_applications ----------
app.post('/api/specialist-applications', async (req, res) => {
  const { name, email, specialty, message } = req.body || {};
  if (!name || !email || !specialty) return res.status(400).json({ success: false, message: 'Name, email and specialty are required.' });
  if (!db.connected || !(await hasDashboard())) {
    console.log('Specialist application (no DB):', { name, email, specialty });
    return res.json({ success: true, message: "Thank you! We'll review your application and be in touch within 48 hours." });
  }
  try {
    await db.query(
      'INSERT INTO specialist_applications (name, email, specialty) VALUES ($1, $2, $3)',
      [name.trim(), email.trim().toLowerCase(), specialty.trim()]
    );
    res.json({ success: true, message: "Application received! We'll review it and be in touch within 48 hours." });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'An application with this email already exists.' });
    console.error('POST /api/specialist-applications', err);
    res.status(500).json({ success: false, message: 'Could not save. Please try again.' });
  }
});

// ---------- POST: Join / Contact form → join_applications ----------
app.post('/api/contact', async (req, res) => {
  const { name, email, message, service } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }
  if (db.connected) {
    try {
      await db.query(
        'INSERT INTO join_applications (name, email, service, message) VALUES ($1, $2, $3, $4)',
        [name.trim(), email.trim(), (service || '').trim(), message.trim()]
      );
    } catch (err) {
      console.error('POST /api/contact', err);
      return res.status(500).json({ success: false, message: 'Could not save. Please try again.' });
    }
  } else {
    console.log('New join application:', { name, email, service, message });
  }
  res.json({ success: true, message: 'Thank you! We\'ll be in touch within 24 hours.' });
});

// ---------- POST: Free consultation → consultations ----------
app.post('/api/consultation', async (req, res) => {
  const { name, email, phone, concern, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email required.' });
  }
  if (db.connected) {
    try {
      await db.query(
        'INSERT INTO consultations (name, email, phone, concern, message) VALUES ($1, $2, $3, $4, $5)',
        [name.trim(), email.trim(), (phone || '').trim(), (concern || '').trim(), (message || '').trim()]
      );
    } catch (err) {
      console.error('POST /api/consultation', err);
      return res.status(500).json({ success: false, message: 'Could not save. Please try again.' });
    }
  } else {
    console.log('Free consultation request:', { name, email, phone, concern, message });
  }
  res.json({ success: true, message: 'Your free 15-minute consultation has been requested! We\'ll contact you within 24 hours.' });
});

// ---------- Dashboard API (requires dashboard_users table) ----------
const hasDashboard = async () => {
  if (!db.connected) return false;
  try {
    await db.query('SELECT 1 FROM dashboard_users LIMIT 1');
    return true;
  } catch {
    return false;
  }
};

const formatSession = (row, userRow, specialistRow) => ({
  id: String(row.id),
  clientName: userRow ? userRow.name.split(' ')[0] : 'Client',
  specialistName: specialistRow ? specialistRow.name : '',
  specialistType: specialistRow ? specialistRow.role : 'THERAPIST',
  type: row.type,
  time: row.scheduled_at ? new Date(row.scheduled_at).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }) : '',
  durationMinutes: row.duration_minutes,
  status: row.status,
  rating: row.rating ? Number(row.rating) : undefined,
});

// ---------- Auth: login, signup, me ----------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Service unavailable' });
  try {
    const r = await db.query('SELECT id, name, email, role, password_hash FROM dashboard_users WHERE LOWER(email) = LOWER($1)', [email]);
    if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const u = r.rows[0];
    if (!u.password_hash) return res.status(401).json({ error: 'Account not set up for login. Use sign up or contact support.' });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const user = { id: String(u.id), name: u.name, email: u.email, role: u.role };
    const token = createToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, mobile, country } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Service unavailable' });
  try {
    const existing = await db.query('SELECT id FROM dashboard_users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'An account with this email already exists' });
    const password_hash = await bcrypt.hash(password, 10);
    const hasExtra = mobile != null || country != null;
    const r = hasExtra
      ? await db.query(
          'INSERT INTO dashboard_users (name, email, password_hash, role, mobile, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
          [name.trim(), email.trim().toLowerCase(), password_hash, 'USER', (mobile && String(mobile).trim()) || null, (country && String(country).trim()) || null]
        )
      : await db.query(
          'INSERT INTO dashboard_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
          [name.trim(), email.trim().toLowerCase(), password_hash, 'USER']
        );
    const u = r.rows[0];
    const user = { id: String(u.id), name: u.name, email: u.email, role: u.role };
    const token = createToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '42701' || (err.message && err.message.includes('column'))) {
      try {
        const r = await db.query(
          'INSERT INTO dashboard_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
          [name.trim(), email.trim().toLowerCase(), password_hash, 'USER']
        );
        const u = r.rows[0];
        const user = { id: String(u.id), name: u.name, email: u.email, role: u.role };
        const token = createToken(user);
        return res.status(201).json({ user, token });
      } catch (e) {
        console.error('POST /api/auth/signup fallback', e);
        return res.status(500).json({ error: e.message });
      }
    }
    console.error('POST /api/auth/signup', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const bearer = req.headers.authorization;
  const token = bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Service unavailable' });
  try {
    const r = await db.query('SELECT id, name, email, role FROM dashboard_users WHERE id = $1', [payload.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = r.rows[0];
    return res.json({ id: String(u.id), name: u.name, email: u.email, role: u.role });
  } catch (err) {
    console.error('GET /api/auth/me', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/dashboard', async (req, res) => {
  const bearer = req.headers.authorization;
  const token = bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.params.id;
  if (String(payload.id) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
  if (!db.connected || !(await hasDashboard())) {
    return res.status(503).json({ error: 'Dashboard not configured' });
  }
  try {
    const userR = await db.query('SELECT id, name, email, role, healing_score FROM dashboard_users WHERE id = $1', [userId]);
    if (userR.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userR.rows[0];
    if (user.role !== 'USER') return res.status(400).json({ error: 'Not a user account' });

    const statsR = await db.query(
      `SELECT COUNT(*) FILTER (WHERE status = 'COMPLETED') as sessions_completed FROM sessions WHERE user_id = $1`,
      [userId]
    );
    const moodR = await db.query(
      'SELECT COALESCE(AVG(value), 0) as avg FROM mood_log WHERE user_id = $1 AND date >= CURRENT_DATE - 14',
      [userId]
    );
    const postsR = await db.query('SELECT COUNT(*) as c FROM community_posts WHERE user_id = $1', [userId]);
    const sessionsCompleted = parseInt(statsR.rows[0]?.sessions_completed || 0, 10);
    const moodAvg = parseFloat(moodR.rows[0]?.avg || 0).toFixed(1);
    const communityPosts = parseInt(postsR.rows[0]?.c || 0, 10);
    const streak = 7;

    const affR = await db.query('SELECT text FROM affirmations ORDER BY RANDOM() LIMIT 1');
    const tipR = await db.query('SELECT title, description, category, icon FROM brain_tips ORDER BY RANDOM() LIMIT 1');
    const dailyTipR = await db.query('SELECT title, description, category FROM brain_tips ORDER BY RANDOM() LIMIT 1');

    const upcomingR = await db.query(
      `SELECT s.*, u.name as user_name, sp.name as specialist_name, sp.role as specialist_role
       FROM sessions s
       JOIN dashboard_users u ON u.id = s.user_id
       JOIN dashboard_users sp ON sp.id = s.specialist_id
       WHERE s.user_id = $1 AND s.scheduled_at >= NOW() AND s.status IN ('UPCOMING', 'IN_PROGRESS')
       ORDER BY s.scheduled_at ASC LIMIT 10`,
      [userId]
    );
    const specialistsR = await db.query(
      `SELECT sp.id, sp.name, sp.role,
        (SELECT COUNT(*) FROM sessions WHERE specialist_id = sp.id AND status = 'COMPLETED') as session_count,
        (SELECT ROUND(AVG(rating)::numeric, 1) FROM sessions WHERE specialist_id = sp.id AND rating IS NOT NULL) as avg_rating
       FROM dashboard_users sp
       JOIN user_specialists us ON us.specialist_id = sp.id
       WHERE us.user_id = $1`,
      [userId]
    );
    const moodLogR = await db.query(
      'SELECT date::text, value, note FROM mood_log WHERE user_id = $1 ORDER BY date DESC LIMIT 14',
      [userId]
    );
    const milestonesR = await db.query(
      `SELECT m.id, m.title, m.description, m.icon, um.unlocked_at as date
       FROM user_milestones um JOIN milestones m ON m.id = um.milestone_id WHERE um.user_id = $1 ORDER BY um.unlocked_at DESC`,
      [userId]
    );
    const feedR = await db.query(
      `SELECT p.id, u.name as author_name, p.content, p.likes, p.comments, p.created_at
       FROM community_posts p JOIN dashboard_users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 10`
    );

    const upcomingSessions = upcomingR.rows.map(row => formatSession(row, { name: row.user_name }, { name: row.specialist_name, role: row.specialist_role }));
    const specialists = specialistsR.rows.map(r => ({
      id: String(r.id),
      name: r.name,
      type: r.role,
      rating: parseFloat(r.avg_rating || 0) || 0,
      sessionCount: parseInt(r.session_count || 0, 10),
    }));
    const moodLog = moodLogR.rows.map(r => ({ date: r.date, value: r.value, note: r.note || undefined }));
    const milestones = milestonesR.rows.map(r => ({ id: String(r.id), title: r.title, description: r.description, date: r.date, icon: r.icon }));
    const communityFeed = feedR.rows.map(r => ({
      id: String(r.id),
      authorName: r.author_name,
      content: r.content,
      timestamp: r.created_at ? (() => { const d = new Date(r.created_at); const h = Math.round((Date.now() - d) / 3600000); return h < 1 ? 'Just now' : h < 24 ? h + 'h ago' : Math.floor(h / 24) + ' days ago'; })() : '',
      likes: r.likes || 0,
      comments: r.comments || 0,
    }));

    res.json({
      user: { id: String(user.id), name: user.name, email: user.email, role: user.role },
      healingScore: { value: user.healing_score || 0, label: 'Healing Journey' },
      stats: { sessionsCompleted, streak: Number(streak), moodAverage: Number(moodAvg), communityPosts },
      affirmation: affR.rows[0]?.text || 'I am worthy of healing and growth.',
      brainTip: tipR.rows[0] ? { title: tipR.rows[0].title, description: tipR.rows[0].description, icon: tipR.rows[0].icon } : { title: 'Box Breathing', description: 'Inhale 4s, hold 4s, exhale 4s.', icon: '🫁' },
      upcomingSessions,
      specialists,
      moodLog,
      milestones,
      communityFeed,
      dailyBrainTip: dailyTipR.rows[0] ? { title: dailyTipR.rows[0].title, description: dailyTipR.rows[0].description, category: dailyTipR.rows[0].category } : { title: '5-4-3-2-1 Grounding', description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', category: 'Grounding' },
    });
  } catch (err) {
    console.error('GET /api/users/:id/dashboard', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/sessions/upcoming', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT s.*, u.name as user_name, sp.name as specialist_name, sp.role as specialist_role
       FROM sessions s JOIN dashboard_users u ON u.id = s.user_id JOIN dashboard_users sp ON sp.id = s.specialist_id
       WHERE s.user_id = $1 AND s.scheduled_at >= NOW() AND s.status IN ('UPCOMING', 'IN_PROGRESS') ORDER BY s.scheduled_at ASC`,
      [req.params.id]
    );
    res.json(r.rows.map(row => formatSession(row, { name: row.user_name }, { name: row.specialist_name, role: row.specialist_role })));
  } catch (err) {
    console.error('GET /api/users/:id/sessions/upcoming', err);
    res.json([]);
  }
});

app.get('/api/users/:id/specialists', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT sp.id, sp.name, sp.role,
        (SELECT COUNT(*) FROM sessions WHERE specialist_id = sp.id AND status = 'COMPLETED') as session_count,
        (SELECT ROUND(AVG(rating)::numeric, 1) FROM sessions WHERE specialist_id = sp.id AND rating IS NOT NULL) as avg_rating
       FROM dashboard_users sp JOIN user_specialists us ON us.specialist_id = sp.id WHERE us.user_id = $1`,
      [req.params.id]
    );
    res.json(r.rows.map(rr => ({ id: String(rr.id), name: rr.name, type: rr.role, rating: parseFloat(rr.avg_rating || 0) || 0, sessionCount: parseInt(rr.session_count || 0, 10) })));
  } catch (err) {
    console.error('GET /api/users/:id/specialists', err);
    res.json([]);
  }
});

app.get('/api/users/:id/mood-log', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query('SELECT date::text, value, note FROM mood_log WHERE user_id = $1 ORDER BY date DESC LIMIT 30', [req.params.id]);
    res.json(r.rows.map(rr => ({ date: rr.date, value: rr.value, note: rr.note || undefined })));
  } catch (err) {
    console.error('GET /api/users/:id/mood-log', err);
    res.json([]);
  }
});

app.post('/api/users/:id/mood-log', async (req, res) => {
  const { date, value, note } = req.body;
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  if (!date || value == null) return res.status(400).json({ error: 'date and value required' });
  try {
    await db.query(
      'INSERT INTO mood_log (user_id, date, value, note) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, date) DO UPDATE SET value = $3, note = $4',
      [req.params.id, date, Math.min(10, Math.max(1, parseInt(value, 10) || 5)), note || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/users/:id/mood-log', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/community/feed', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT p.id, u.name as author_name, p.content, p.likes, p.comments, p.created_at FROM community_posts p JOIN dashboard_users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 20`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      authorName: rr.author_name,
      content: rr.content,
      timestamp: rr.created_at ? (() => { const d = new Date(rr.created_at); const h = Math.round((Date.now() - d) / 3600000); return h < 1 ? 'Just now' : h < 24 ? h + 'h ago' : Math.floor(h / 24) + ' days ago'; })() : '',
      likes: rr.likes || 0,
      comments: rr.comments || 0,
    })));
  } catch (err) {
    console.error('GET /api/community/feed', err);
    res.json([]);
  }
});

const requireAuth = (req) => {
  const bearer = req.headers.authorization;
  const token = bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
  return token ? verifyToken(token) : null;
};
const requireAdmin = (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (payload.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  return payload;
};
const requireSpecialistSelf = (req, res, id) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (String(payload.id) !== String(id)) return res.status(403).json({ error: 'Forbidden' });
  return payload;
};

app.get('/api/admin/platform-stats', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) {
    return res.json({
      platformScore: 87, uptimePercent: 99.9, activeSessions: 12, errorRate: 0.02,
      revenueToday: 4280, revenueDeltaPercent: 18, revenueSparkline: [3200, 3500, 3800, 3600, 4000, 4200, 4280],
      liveUsers: 48, liveSessions: 12, specialistsOnline: 22,
      totalUsers: 1240, totalSpecialists: 84, sessionsThisMonth: 892, avgSessionRating: 4.7, revenueMTD: 98420, newApplications: 5,
    });
  }
  try {
    const usersR = await db.query("SELECT COUNT(*) as c FROM dashboard_users WHERE role = 'USER'");
    const specialistsR = await db.query("SELECT COUNT(*) as c FROM dashboard_users WHERE role IN ('THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR')");
    const sessionsR = await db.query("SELECT COUNT(*) as c FROM sessions WHERE scheduled_at >= date_trunc('month', CURRENT_DATE) AND status = 'COMPLETED'");
    const ratingR = await db.query('SELECT ROUND(AVG(rating)::numeric, 1) as avg FROM sessions WHERE rating IS NOT NULL');
    const appsR = await db.query("SELECT COUNT(*) as c FROM specialist_applications WHERE status = 'PENDING'");
    const sessionsTodayR = await db.query("SELECT COUNT(*) as c FROM sessions WHERE scheduled_at::date = CURRENT_DATE AND status IN ('UPCOMING', 'IN_PROGRESS')");
    const totalUsers = parseInt(usersR.rows[0]?.c || 0, 10);
    const totalSpecialists = parseInt(specialistsR.rows[0]?.c || 0, 10);
    const sessionsThisMonth = parseInt(sessionsR.rows[0]?.c || 0, 10);
    const avgRating = parseFloat(ratingR.rows[0]?.avg || 0) || 4.7;
    const newApplications = parseInt(appsR.rows[0]?.c || 0, 10);
    const liveSessions = parseInt(sessionsTodayR.rows[0]?.c || 0, 10);
    const revenueMTD = sessionsThisMonth * 110;
    const revenueToday = Math.min(5000, Math.round(revenueMTD / 30 * (0.8 + Math.random() * 0.4)));
    res.json({
      platformScore: 87,
      uptimePercent: 99.9,
      activeSessions: liveSessions,
      errorRate: 0.02,
      revenueToday,
      revenueDeltaPercent: 18,
      revenueSparkline: [revenueToday - 800, revenueToday - 500, revenueToday - 200, revenueToday - 100, revenueToday],
      liveUsers: totalUsers,
      liveSessions,
      specialistsOnline: totalSpecialists,
      totalUsers,
      totalSpecialists,
      sessionsThisMonth,
      avgSessionRating: avgRating,
      revenueMTD,
      newApplications,
    });
  } catch (err) {
    console.error('GET /api/admin/platform-stats', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/applications', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query('SELECT id, name, email, specialty, status, applied_at FROM specialist_applications ORDER BY applied_at DESC');
    res.json(r.rows.map(rr => ({ id: String(rr.id), name: rr.name, email: rr.email, specialty: rr.specialty, status: rr.status, appliedAt: rr.applied_at })));
  } catch (err) {
    console.error('GET /api/admin/applications', err);
    res.json([]);
  }
});

app.patch('/api/admin/applications/:id', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  const { status } = req.body;
  if (!status || !['APPROVED', 'REJECTED', 'REVIEWING', 'PENDING'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    await db.query('UPDATE specialist_applications SET status = $1 WHERE id = $2', [status, req.params.id]);

    let newUser = null;
    if (status === 'APPROVED') {
      const appR = await db.query('SELECT name, email, specialty FROM specialist_applications WHERE id = $1', [req.params.id]);
      if (appR.rows.length > 0) {
        const app = appR.rows[0];
        const roleMap = {
          'Licensed Therapist': 'THERAPIST',
          'Trauma Specialist': 'THERAPIST',
          'Group Facilitator': 'THERAPIST',
          'Specialized Expert': 'LIFE_COACH',
          'THERAPIST': 'THERAPIST',
          'LIFE_COACH': 'LIFE_COACH',
          'HYPNOTHERAPIST': 'HYPNOTHERAPIST',
          'MUSIC_TUTOR': 'MUSIC_TUTOR',
        };
        const role = roleMap[app.specialty] || 'THERAPIST';
        const existing = await db.query('SELECT id FROM dashboard_users WHERE LOWER(email) = LOWER($1)', [app.email]);
        if (existing.rows.length === 0) {
          const TEMP_PASS = process.env.THERAPIST_TEMP_PASSWORD || 'Welcome@BTB2026';
          const hash = await bcrypt.hash(TEMP_PASS, 10);
          const uR = await db.query(
            'INSERT INTO dashboard_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [app.name.trim(), app.email.trim().toLowerCase(), hash, role]
          );
          newUser = { id: String(uR.rows[0].id), name: uR.rows[0].name, email: uR.rows[0].email, role, tempPassword: TEMP_PASS };
          await db.query("INSERT INTO activity_log (type, message) VALUES ('specialist_approved', $1)", [`${app.name} (${app.email}) approved as ${role} — account created`]);
          console.log(`Approved specialist: ${app.name} <${app.email}> as ${role}, temp password set.`);
        }
      }
    }

    res.json({ success: true, newUser });
  } catch (err) {
    console.error('PATCH /api/admin/applications/:id', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/sessions', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT s.id, u.name as user_name, sp.name as specialist_name, sp.role as specialist_role, s.duration_minutes, s.rating, s.status
       FROM sessions s JOIN dashboard_users u ON u.id = s.user_id JOIN dashboard_users sp ON sp.id = s.specialist_id
       ORDER BY s.scheduled_at DESC LIMIT 50`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      userName: rr.user_name,
      specialistName: rr.specialist_name,
      specialty: rr.specialist_role,
      durationMinutes: rr.duration_minutes,
      rating: rr.rating ? Number(rr.rating) : null,
      status: rr.status,
    })));
  } catch (err) {
    console.error('GET /api/admin/sessions', err);
    res.json([]);
  }
});

app.get('/api/admin/users', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query("SELECT id, name, email, role FROM dashboard_users WHERE role = 'USER' ORDER BY id");
    res.json(r.rows.map(rr => ({ id: String(rr.id), name: rr.name, email: rr.email, role: rr.role })));
  } catch (err) {
    console.error('GET /api/admin/users', err);
    res.json([]);
  }
});

app.get('/api/admin/specialists', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT id, name, role,
        (SELECT COUNT(*) FROM sessions WHERE specialist_id = dashboard_users.id AND status = 'COMPLETED') as session_count,
        (SELECT ROUND(AVG(rating)::numeric, 1) FROM sessions WHERE specialist_id = dashboard_users.id AND rating IS NOT NULL) as avg_rating
       FROM dashboard_users WHERE role IN ('THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR') ORDER BY name`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      name: rr.name,
      specialty: rr.role,
      active: true,
      sessionCount: parseInt(rr.session_count || 0, 10),
      rating: parseFloat(rr.avg_rating || 0) || 0,
    })));
  } catch (err) {
    console.error('GET /api/admin/specialists', err);
    res.json([]);
  }
});

app.get('/api/admin/activity-log', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query('SELECT id, type, message, created_at FROM activity_log ORDER BY created_at DESC LIMIT 30');
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      type: rr.type,
      message: rr.message,
      timestamp: rr.created_at ? (() => { const d = new Date(rr.created_at); const m = Math.round((Date.now() - d) / 60000); return m < 60 ? m + ' min ago' : Math.floor(m / 60) + ' hours ago'; })() : '',
    })));
  } catch (err) {
    console.error('GET /api/admin/activity-log', err);
    res.json([]);
  }
});

// ---------- Browse all active specialists (for user discovery) ----------
app.get('/api/specialists/browse', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) {
    return res.json([
      { id: '2', name: 'Dr. Sarah Chen', role: 'THERAPIST', speciality: 'Anxiety, Trauma & PTSD', bio: 'Over 12 years helping clients rebuild confidence after trauma. CBT-certified.', rating: 4.9, sessionCount: 248 },
      { id: '3', name: 'James Miller', role: 'LIFE_COACH', speciality: 'Burnout & Life Transitions', bio: 'Specialist in workplace stress and goal alignment.', rating: 4.8, sessionCount: 180 },
      { id: '4', name: 'Maya Foster', role: 'HYPNOTHERAPIST', speciality: 'Habit & Behaviour Change', bio: 'Combines evidence-based hypnotherapy with mindfulness.', rating: 4.7, sessionCount: 132 },
    ]);
  }
  try {
    const r = await db.query(
      `SELECT u.id, u.name, u.role, u.avatar_url,
        ROUND(AVG(s.rating)::numeric, 1) as avg_rating,
        COUNT(s.id) FILTER (WHERE s.status = 'COMPLETED') as session_count
       FROM dashboard_users u
       LEFT JOIN sessions s ON s.specialist_id = u.id
       WHERE u.role IN ('THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR')
       GROUP BY u.id, u.name, u.role, u.avatar_url
       ORDER BY session_count DESC, avg_rating DESC`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      name: rr.name,
      role: rr.role,
      avatarUrl: rr.avatar_url || null,
      rating: rr.avg_rating ? Number(rr.avg_rating) : null,
      sessionCount: parseInt(rr.session_count || '0', 10),
    })));
  } catch (err) {
    console.error('GET /api/specialists/browse', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specialists/:id/dashboard', async (req, res) => {
  const id = req.params.id;
  if (requireSpecialistSelf(req, res, id) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const spR = await db.query('SELECT id, name, email, role FROM dashboard_users WHERE id = $1 AND role IN (\'THERAPIST\', \'LIFE_COACH\', \'HYPNOTHERAPIST\', \'MUSIC_TUTOR\')', [id]);
    if (spR.rows.length === 0) return res.status(404).json({ error: 'Specialist not found' });
    const sp = spR.rows[0];
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const scheduleR = await db.query(
      `SELECT s.*, u.name as user_name FROM sessions s JOIN dashboard_users u ON u.id = s.user_id
       WHERE s.specialist_id = $1 AND s.scheduled_at >= $2 AND s.scheduled_at <= $3 ORDER BY s.scheduled_at`,
      [id, todayStart, todayEnd]
    );
    const clientsR = await db.query(
      `SELECT u.id, u.name, COUNT(s.id) as session_count, MAX(s.scheduled_at)::date as last_date
       FROM sessions s JOIN dashboard_users u ON u.id = s.user_id
       WHERE s.specialist_id = $1 AND s.status = 'COMPLETED'
       GROUP BY u.id, u.name`
    );
    const notesR = await db.query(
      `SELECT n.id, n.content, n.created_at, u.name as client_name FROM session_notes n JOIN dashboard_users u ON u.id = n.user_id WHERE n.specialist_id = $1 ORDER BY n.created_at DESC LIMIT 10`,
      [id]
    );
    const requestsR = await db.query(
      `SELECT br.id, u.name as client_name, br.proposed_at, br.session_type FROM booking_requests br JOIN dashboard_users u ON u.id = br.user_id WHERE br.specialist_id = $1 AND br.status = 'PENDING'`
    );
    const reviewsR = await db.query(
      `SELECT r.id, r.rating, r.excerpt, r.created_at, u.name as client_name FROM reviews r JOIN dashboard_users u ON u.id = r.user_id WHERE r.specialist_id = $1 ORDER BY r.created_at DESC LIMIT 5`,
      [id]
    );
    const earningsR = await db.query(
      "SELECT COUNT(*) as cnt FROM sessions WHERE specialist_id = $1 AND status = 'COMPLETED' AND scheduled_at >= date_trunc('month', CURRENT_DATE)",
      [id]
    );
    const sessionsCount = parseInt(earningsR.rows[0]?.cnt || 0, 10);
    const rate = 75;
    const todaySchedule = scheduleR.rows.map(row => formatSession(row, { name: row.user_name }, sp));
    const clients = clientsR.rows.map(r => ({
      id: String(r.id),
      name: r.name,
      sessionCount: parseInt(r.session_count || 0, 10),
      lastSessionDate: r.last_date,
      progressScore: 60 + Math.floor(Math.random() * 30),
      metricLabel: 'Progress',
      metricValue: 'Improving',
    }));
    const recentNotes = notesR.rows.map(r => ({
      id: String(r.id),
      clientName: r.client_name,
      date: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '',
      preview: (r.content || '').slice(0, 80) + (r.content && r.content.length > 80 ? '...' : ''),
      tags: [],
      isPrivate: true,
    }));
    const pendingRequests = requestsR.rows.map(r => ({
      id: String(r.id),
      clientName: r.client_name,
      requestedAt: '1 hour ago',
      proposedTime: r.proposed_at ? new Date(r.proposed_at).toLocaleString() : '',
      sessionType: r.session_type,
    }));
    const reviews = reviewsR.rows.map(r => ({
      id: String(r.id),
      clientName: r.client_name,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '',
      rating: r.rating,
      excerpt: r.excerpt || '',
    }));
    res.json({
      specialist: { id: String(sp.id), name: sp.name, email: sp.email, role: sp.role },
      practiceScore: 96,
      todayStats: { sessionsToday: scheduleR.rows.length, hoursBooked: (scheduleR.rows.reduce((a, r) => a + r.duration_minutes, 0) / 60).toFixed(1), newRequests: requestsR.rows.length, completionRate: 94 },
      earningsThisMonth: sessionsCount * rate,
      earningsDeltaPercent: 12,
      earningsSparkline: [sessionsCount * rate - 400, sessionsCount * rate - 200, sessionsCount * rate],
      stats: { activeClients: clients.length, sessionsThisWeek: sessionsCount, avgRating: 4.8, completionRate: 94, responseTimeMinutes: 45 },
      todaySchedule,
      clients,
      recentNotes,
      pendingRequests,
      clientMilestones: [],
      reviews,
      earningsBreakdown: { sessionsCount, rate, pendingPayout: 0, paidOut: sessionsCount * rate },
    });
  } catch (err) {
    console.error('GET /api/specialists/:id/dashboard', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specialists/:id/clients', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT u.id, u.name, COUNT(s.id) as session_count, MAX(s.scheduled_at)::date as last_date
       FROM sessions s JOIN dashboard_users u ON u.id = s.user_id WHERE s.specialist_id = $1 AND s.status = 'COMPLETED' GROUP BY u.id, u.name`,
      [req.params.id]
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      name: rr.name,
      sessionCount: parseInt(rr.session_count || 0, 10),
      lastSessionDate: String(rr.last_date),
      progressScore: 60 + Math.floor(Math.random() * 30),
      metricLabel: 'Progress',
      metricValue: 'Improving',
    })));
  } catch (err) {
    console.error('GET /api/specialists/:id/clients', err);
    res.json([]);
  }
});

app.get('/api/specialists/:id/sessions/today', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const r = await db.query(
      `SELECT s.*, u.name as user_name FROM sessions s JOIN dashboard_users u ON u.id = s.user_id
       WHERE s.specialist_id = $1 AND s.scheduled_at >= $2 AND s.scheduled_at <= $3 ORDER BY s.scheduled_at`,
      [req.params.id, todayStart, todayEnd]
    );
    const spR = await db.query('SELECT id, name, role FROM dashboard_users WHERE id = $1', [req.params.id]);
    const sp = spR.rows[0];
    res.json(r.rows.map(row => formatSession(row, { name: row.user_name }, sp)));
  } catch (err) {
    console.error('GET /api/specialists/:id/sessions/today', err);
    res.json([]);
  }
});

app.get('/api/specialists/:id/notes', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      'SELECT n.id, n.content, n.created_at, u.name as client_name FROM session_notes n JOIN dashboard_users u ON u.id = n.user_id WHERE n.specialist_id = $1 ORDER BY n.created_at DESC LIMIT 20',
      [req.params.id]
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      clientName: rr.client_name,
      date: rr.created_at ? new Date(rr.created_at).toISOString().slice(0, 10) : '',
      preview: (rr.content || '').slice(0, 80) + '...',
      tags: [],
      isPrivate: true,
    })));
  } catch (err) {
    console.error('GET /api/specialists/:id/notes', err);
    res.json([]);
  }
});

app.get('/api/specialists/:id/requests', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT br.id, u.name as client_name, br.proposed_at, br.session_type FROM booking_requests br JOIN dashboard_users u ON u.id = br.user_id WHERE br.specialist_id = $1 AND br.status = 'PENDING'`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      clientName: rr.client_name,
      requestedAt: '1 hour ago',
      proposedTime: rr.proposed_at ? new Date(rr.proposed_at).toLocaleString() : '',
      sessionType: rr.session_type,
    })));
  } catch (err) {
    console.error('GET /api/specialists/:id/requests', err);
    res.json([]);
  }
});

app.patch('/api/specialists/:id/requests/:requestId', async (req, res) => {
  const { status } = req.body;
  if (!status || !['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    await db.query('UPDATE booking_requests SET status = $1 WHERE id = $2 AND specialist_id = $3', [status.toUpperCase() === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED', req.params.requestId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/specialists/:id/requests/:requestId', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specialists/:id/reviews', async (req, res) => {
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      'SELECT r.id, r.rating, r.excerpt, r.created_at, u.name as client_name FROM reviews r JOIN dashboard_users u ON u.id = r.user_id WHERE r.specialist_id = $1 ORDER BY r.created_at DESC LIMIT 10',
      [req.params.id]
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      clientName: rr.client_name,
      date: rr.created_at ? new Date(rr.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '',
      rating: rr.rating,
      excerpt: rr.excerpt || '',
    })));
  } catch (err) {
    console.error('GET /api/specialists/:id/reviews', err);
    res.json([]);
  }
});

// ---------- Health check (API + DB) ----------
app.get('/api/health', async (req, res) => {
  let dbOk = false;
  if (db.connected) {
    try {
      await db.query('SELECT 1');
      dbOk = true;
    } catch (e) {
      console.error('Health check DB:', e.message);
    }
  }
  res.json({ ok: true, db: dbOk ? 'connected' : (db.connected ? 'error' : 'not configured') });
});

// ─── Auto-migrate: create schema + seed base users (idempotent) ─────────────
async function autoMigrate() {
  if (!db.connected) return;
  try {
    // 0. Website forms (consultation + join) — no FK to dashboard
    await db.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL,
        phone      VARCHAR(50),
        concern    VARCHAR(255),
        message    TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS join_applications (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL,
        service    VARCHAR(255),
        message    TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // 1. Create all dashboard tables (safe — IF NOT EXISTS)
    await db.query(`
      CREATE TABLE IF NOT EXISTS dashboard_users (
        id             SERIAL PRIMARY KEY,
        name           VARCHAR(255) NOT NULL,
        email          VARCHAR(255) NOT NULL UNIQUE,
        password_hash  VARCHAR(255),
        role           VARCHAR(50)  NOT NULL DEFAULT 'USER',
        avatar_url     VARCHAR(500),
        healing_score  INT DEFAULT 0,
        created_at     TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_specialists (
        user_id       INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        specialist_id  INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, specialist_id)
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id               SERIAL PRIMARY KEY,
        user_id          INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        specialist_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        type             VARCHAR(100) NOT NULL,
        scheduled_at     TIMESTAMPTZ NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 50,
        status           VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING',
        rating           DECIMAL(2,1),
        completed_at     TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS mood_log (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        date       DATE NOT NULL,
        value      INT NOT NULL CHECK (value >= 1 AND value <= 10),
        note       TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, date)
      );
      CREATE TABLE IF NOT EXISTS milestones (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        icon        VARCHAR(20),
        sort_order  INT DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS user_milestones (
        user_id      INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
        unlocked_at  DATE NOT NULL DEFAULT CURRENT_DATE,
        PRIMARY KEY (user_id, milestone_id)
      );
      CREATE TABLE IF NOT EXISTS community_posts (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        likes      INT NOT NULL DEFAULT 0,
        comments   INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS specialist_applications (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL,
        specialty  VARCHAR(50)  NOT NULL,
        status     VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
        applied_at TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS session_notes (
        id            SERIAL PRIMARY KEY,
        session_id    INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        specialist_id INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        user_id       INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        content       TEXT NOT NULL,
        is_private    BOOLEAN DEFAULT TRUE,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS booking_requests (
        id            SERIAL PRIMARY KEY,
        specialist_id INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        user_id       INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        proposed_at   TIMESTAMPTZ NOT NULL,
        session_type  VARCHAR(100) NOT NULL,
        status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id            SERIAL PRIMARY KEY,
        session_id    INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        user_id       INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        specialist_id  INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        excerpt       TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS activity_log (
        id         SERIAL PRIMARY KEY,
        type       VARCHAR(50) NOT NULL,
        message    TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_specialist ON sessions(specialist_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_scheduled  ON sessions(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_status     ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_mood_log_user_date  ON mood_log(user_id, date DESC);
      CREATE INDEX IF NOT EXISTS idx_community_created   ON community_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_created    ON activity_log(created_at DESC);
    `);
    console.log('autoMigrate: schema OK');

    // 1b. Add optional user profile columns if missing (safe for existing DBs)
    for (const col of ['mobile', 'country']) {
      try {
        await db.query(`ALTER TABLE dashboard_users ADD COLUMN ${col} VARCHAR(100)`);
      } catch (e) {
        if (e.code !== '42701') throw e; // 42701 = duplicate_column
      }
    }

    // 2. Insert base users (admin + 4 specialists) — skip if already present
    await db.query(`
      INSERT INTO dashboard_users (id, name, email, role, healing_score) VALUES
        (1, 'Admin',        'admin@beyondthebody.fit', 'ADMIN',         0),
        (2, 'Dr. Sarah Chen','sarah@btb.fit',           'THERAPIST',     0),
        (3, 'James Miller', 'james@btb.fit',            'LIFE_COACH',    0),
        (4, 'Maya Foster',  'maya@btb.fit',             'HYPNOTHERAPIST',0),
        (5, 'Leo Torres',   'leo@btb.fit',              'MUSIC_TUTOR',   0)
      ON CONFLICT (email) DO NOTHING;
      -- keep sequence in sync if rows were inserted
      SELECT setval('dashboard_users_id_seq', GREATEST((SELECT MAX(id) FROM dashboard_users), 5));
    `);

    // 3. Insert default milestones
    await db.query(`
      INSERT INTO milestones (title, description, icon, sort_order) VALUES
        ('First session completed', 'You began your healing journey',      '🌱', 1),
        ('10 sessions milestone',   'Consistency is your superpower',      '✨', 2),
        ('7-day streak',            'Daily check-ins for 7 days',          '🔥', 3)
      ON CONFLICT DO NOTHING;
    `);

    // 4. Seed passwords for accounts that still have NULL password_hash
    const ADMIN_PASS     = process.env.ADMIN_PASSWORD     || 'Admin@BTB2026';
    const THERAPIST_PASS = process.env.THERAPIST_PASSWORD || 'Therapist@BTB2026';
    const SPECIALIST_PASS = process.env.THERAPIST_PASSWORD || 'Therapist@BTB2026';

    const r = await db.query(
      `SELECT id, email FROM dashboard_users
       WHERE password_hash IS NULL
         AND role IN ('ADMIN','THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR')`
    );
    for (const u of r.rows) {
      const plain = u.id === 1 ? ADMIN_PASS : SPECIALIST_PASS;
      const hash  = await bcrypt.hash(plain, 10);
      await db.query('UPDATE dashboard_users SET password_hash = $1 WHERE id = $2', [hash, u.id]);
      console.log(`autoMigrate: password set for ${u.email} (id=${u.id})`);
    }

    // 5. Seed test data (user, admin, therapist) — idempotent, skip if test users already have sessions
    const TEST_PASS = 'TestUser@123';
    const testUserHash = await bcrypt.hash(TEST_PASS, 10);
    const testUsers = [
      { name: 'Test User One', email: 'testuser1@test.btb.fit', healing_score: 62 },
      { name: 'Test User Two', email: 'testuser2@test.btb.fit', healing_score: 58 },
      { name: 'Alex Demo', email: 'alex.demo@test.btb.fit', healing_score: 71 },
    ];
    for (const u of testUsers) {
      await db.query(
        `INSERT INTO dashboard_users (name, email, password_hash, role, healing_score) VALUES ($1, $2, $3, 'USER', $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, testUserHash, u.healing_score]
      );
    }
    const testUserRows = await db.query(
      "SELECT id, email FROM dashboard_users WHERE email LIKE '%@test.btb.fit' ORDER BY id"
    );
    const specialistId = 2; // Dr. Sarah Chen
    for (const u of testUserRows.rows) {
      await db.query(
        'INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT (user_id, specialist_id) DO NOTHING',
        [u.id, specialistId]
      );
    }
    const hasSessions = await db.query(
      "SELECT 1 FROM sessions s JOIN dashboard_users u ON u.id = s.user_id WHERE u.email LIKE '%@test.btb.fit' LIMIT 1"
    );
    if (testUserRows.rows.length > 0 && hasSessions.rows.length === 0) {
      const uid = testUserRows.rows[0].id;
      const now = new Date();
      const specialistIds = [2, 3, 4, 5]; // Dr. Sarah Chen, James Miller, Maya Foster, Leo Torres
      for (const sid of specialistIds) {
        await db.query(
          'INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT (user_id, specialist_id) DO NOTHING',
          [uid, sid]
        );
      }
      await db.query('UPDATE dashboard_users SET healing_score = 74 WHERE id = $1', [uid]);
      const sessionTypes = ['1:1 Therapy', 'Coaching', 'Hypnosis', 'Mindfulness', 'Follow-up', 'Deep Dive', 'Check-in'];
      const completedSessions = [];
      for (let i = 0; i < 10; i++) {
        const d = new Date(now); d.setDate(d.getDate() - (14 + i * 4)); d.setHours(10 + (i % 3), 0, 0, 0);
        const spId = specialistIds[i % specialistIds.length];
        const r = await db.query(
          `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status, completed_at, rating)
           VALUES ($1, $2, $3, $4, ${50 + (i % 3) * 5}, 'COMPLETED', $4, ${4 + (i % 2)}) RETURNING id`,
          [uid, spId, sessionTypes[i % sessionTypes.length], d]
        );
        if (r.rows[0]?.id) {
          completedSessions.push({ id: r.rows[0].id, specialistId: spId });
        }
      }
      for (const s of completedSessions.slice(0, 6)) {
        await db.query(
          'INSERT INTO session_notes (session_id, specialist_id, user_id, content, is_private) VALUES ($1, $2, $3, $4, true)',
          [s.id, s.specialistId, uid, ['Great progress on goals today.', 'Explored breathing techniques. Client engaged.', 'Set action steps for the week.', 'Reflected on wins. Mood improving.', 'Reviewed homework. On track.', 'Breakthrough moment — client shared openly.'][completedSessions.indexOf(s) % 6]]
        );
        await db.query(
          'INSERT INTO reviews (session_id, user_id, specialist_id, rating, excerpt) VALUES ($1, $2, $3, 5, $4)',
          [s.id, uid, s.specialistId, 5, ['Life-changing support.', 'So grateful for this space.', 'Always feel heard.', 'Best decision I made.', 'Progress I never thought possible.', 'Thank you for the safe space.'][completedSessions.indexOf(s) % 6]]
        );
      }
      for (let i = 0; i < 6; i++) {
        const d = new Date(now); d.setDate(d.getDate() + (i + 1)); d.setHours(9 + (i % 2) * 4, 30 * (i % 2), 0, 0);
        await db.query(
          `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status)
           VALUES ($1, $2, $3, $4, 50, 'UPCOMING')`,
          [uid, specialistIds[i % specialistIds.length], ['1:1 Therapy', 'Coaching', 'Check-in', 'Follow-up', 'Mindfulness', 'Hypnosis'][i], d]
        );
      }
      for (let d = 0; d < 30; d++) {
        const dte = new Date(now); dte.setDate(dte.getDate() - d);
        const dateStr = dte.toISOString().slice(0, 10);
        const value = d < 7 ? 6 + (d % 3) : (5 + Math.floor(Math.random() * 4));
        const notes = ['Feeling calm', 'Good sleep', 'Productive day', 'Mindful morning', 'Grateful', 'Stayed present', 'Small win today', null, null, null];
        await db.query(
          'INSERT INTO mood_log (user_id, date, value, note) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, date) DO UPDATE SET value = $3, note = $4',
          [uid, dateStr, value, notes[d % notes.length]]
        );
      }
      await db.query(
        'INSERT INTO user_milestones (user_id, milestone_id, unlocked_at) VALUES ($1, 1, CURRENT_DATE - 60), ($1, 2, CURRENT_DATE - 20), ($1, 3, CURRENT_DATE - 8) ON CONFLICT (user_id, milestone_id) DO NOTHING',
        [uid]
      );
      const myPosts = [
        'Grateful for this community and my progress this month. Small steps every day add up.',
        'Anyone else find morning meditation game-changing? Share your routine!',
        '10 sessions in with my therapist — the consistency is paying off. To anyone just starting: stick with it.',
        'Hit my 7-day streak today. The app reminders actually help.',
        'Shared my first milestone in the group. The support here is real.',
      ];
      for (const content of myPosts) {
        await db.query(
          'INSERT INTO community_posts (user_id, content, likes, comments) VALUES ($1, $2, $3, $4)',
          [uid, content, 8 + Math.floor(Math.random() * 15), 1 + Math.floor(Math.random() * 6)]
        );
      }
      if (testUserRows.rows[1]) {
        const others = [
          'Second week in — already noticing a shift in how I handle stress.',
          'This community gets it. No judgment, just growth.',
          'Had a breakthrough in my last session. Sharing in case it helps someone.',
        ];
        for (const content of others) {
          await db.query(
            'INSERT INTO community_posts (user_id, content, likes, comments) VALUES ($1, $2, $3, $4)',
            [testUserRows.rows[1].id, content, 5 + Math.floor(Math.random() * 8), 1 + Math.floor(Math.random() * 3)]
          );
        }
      }
      const appCount = await db.query("SELECT COUNT(*) as c FROM specialist_applications WHERE email IN ('elena.v@example.com','marcus.r@example.com','priya.s@example.com')");
      if (parseInt(appCount.rows[0]?.c || 0, 10) === 0) {
        await db.query(
          `INSERT INTO specialist_applications (name, email, specialty, status) VALUES
           ('Elena Vasquez', 'elena.v@example.com', 'THERAPIST', 'PENDING'),
           ('Marcus Reid', 'marcus.r@example.com', 'LIFE_COACH', 'PENDING'),
           ('Priya Sharma', 'priya.s@example.com', 'HYPNOTHERAPIST', 'PENDING')`
        );
      }
      const nextDay = new Date(now); nextDay.setDate(nextDay.getDate() + 2); nextDay.setHours(15, 0, 0, 0);
      await db.query(
        'INSERT INTO booking_requests (specialist_id, user_id, proposed_at, session_type, status) VALUES ($1, $2, $3, $4, $5)',
        [specialistId, uid, nextDay, '1:1 Therapy', 'PENDING']
      );
      await db.query(
        `INSERT INTO activity_log (type, message) VALUES
         ('user_signup', 'New user signed up: testuser1@test.btb.fit'),
         ('session_completed', 'Session completed — Test User One & Dr. Sarah Chen'),
         ('application_submitted', 'New specialist application: Elena Vasquez (Therapist)')`
      );
      console.log('autoMigrate: test data seeded (users, sessions, mood, community, applications, activity). Login: testuser1@test.btb.fit / TestUser@123');
    }

    // 6. Top-up testuser1 for presentation (add more data if account exists but has few sessions)
    const t1 = await db.query("SELECT id FROM dashboard_users WHERE email = 'testuser1@test.btb.fit' LIMIT 1");
    if (t1.rows.length > 0) {
      const uid = t1.rows[0].id;
      const countR = await db.query('SELECT COUNT(*) as c FROM sessions WHERE user_id = $1', [uid]);
      const sessionCount = parseInt(countR.rows[0]?.c || 0, 10);
      if (sessionCount < 12) {
        const specialistIds = [2, 3, 4, 5];
        for (const sid of specialistIds) {
          await db.query(
            'INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT (user_id, specialist_id) DO NOTHING',
            [uid, sid]
          );
        }
        await db.query('UPDATE dashboard_users SET healing_score = 74 WHERE id = $1', [uid]);
        const now = new Date();
        for (let i = sessionCount; i < 10; i++) {
          const d = new Date(now); d.setDate(d.getDate() - (14 + i * 4)); d.setHours(10, 0, 0, 0);
          const spId = specialistIds[i % specialistIds.length];
          await db.query(
            `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status, completed_at, rating)
             VALUES ($1, $2, '1:1 Therapy', $3, 50, 'COMPLETED', $3, 5)`,
            [uid, spId, d]
          );
        }
        for (let d = 0; d < 30; d++) {
          const dte = new Date(now); dte.setDate(dte.getDate() - d);
          const dateStr = dte.toISOString().slice(0, 10);
          const value = 5 + Math.floor(Math.random() * 4);
          await db.query(
            'INSERT INTO mood_log (user_id, date, value, note) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, date) DO UPDATE SET value = $3, note = $4',
            [uid, dateStr, value, d < 3 ? 'Feeling good' : null]
          );
        }
        await db.query(
          'INSERT INTO user_milestones (user_id, milestone_id, unlocked_at) VALUES ($1, 1, CURRENT_DATE - 60), ($1, 2, CURRENT_DATE - 20), ($1, 3, CURRENT_DATE - 8) ON CONFLICT (user_id, milestone_id) DO NOTHING',
          [uid]
        );
        const extraPosts = [
          '10 sessions in — the consistency is paying off. To anyone just starting: stick with it.',
          'Hit my 7-day streak today. The app reminders actually help.',
          'Shared my first milestone. The support here is real.',
        ];
        for (const content of extraPosts) {
          await db.query(
            'INSERT INTO community_posts (user_id, content, likes, comments) VALUES ($1, $2, 10, 2)',
            [uid, content]
          );
        }
        const upcomingCount = await db.query(
          "SELECT COUNT(*) as c FROM sessions WHERE user_id = $1 AND status = 'UPCOMING'",
          [uid]
        );
        if (parseInt(upcomingCount.rows[0]?.c || 0, 10) < 4) {
          for (let i = 0; i < 4; i++) {
            const d = new Date(now); d.setDate(d.getDate() + i + 1); d.setHours(10 + i, 0, 0, 0);
            await db.query(
              `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status)
               VALUES ($1, $2, 'Coaching', $3, 50, 'UPCOMING')`,
              [uid, specialistIds[i % specialistIds.length], d]
            );
          }
        }
        console.log('autoMigrate: testuser1 presentation data topped up (sessions, mood, milestones, community).');
      }
    }

    console.log('autoMigrate: done');
  } catch (err) {
    console.error('autoMigrate error:', err.message);
  }
}

function startServer(port) {
  const server = app.listen(port, async () => {
    console.log(`Beyond The Body server running on http://localhost:${port}`);
    if (db.connected) {
      console.log('PostgreSQL: connected');
      await autoMigrate();
    } else {
      console.log('PostgreSQL: not configured (using in-memory data). Set DATABASE_URL to use DB.');
    }
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
}

startServer(PORT);
