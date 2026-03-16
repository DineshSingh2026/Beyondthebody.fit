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
    const r = await db.query('SELECT id, name, email, role, password_hash, suspended FROM dashboard_users WHERE LOWER(email) = LOWER($1)', [email]);
    if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const u = r.rows[0];
    if (u.suspended) return res.status(403).json({ error: 'Account suspended. Please contact support.' });
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
    const r = await db.query('SELECT id, name, email, role, suspended FROM dashboard_users WHERE id = $1', [payload.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = r.rows[0];
    if (u.suspended) return res.status(403).json({ error: 'Account suspended. Please contact support.' });
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

// Conversation partners for messaging: specialists from user_specialists + anyone with direct_messages
app.get('/api/users/:id/conversation-partners', async (req, res) => {
  const bearer = req.headers.authorization;
  const token = bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (String(payload.id) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden' });
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT DISTINCT u.id, u.name, u.role FROM dashboard_users u
       WHERE u.id IN (
         SELECT specialist_id FROM user_specialists WHERE user_id = $1
         UNION
         SELECT from_user_id FROM direct_messages WHERE to_user_id = $1
         UNION
         SELECT to_user_id FROM direct_messages WHERE from_user_id = $1
       ) AND u.role IN ('THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR')
       ORDER BY u.name`,
      [req.params.id]
    );
    res.json(r.rows.map(rr => ({ id: String(rr.id), name: rr.name, type: rr.role })));
  } catch (err) {
    console.error('GET /api/users/:id/conversation-partners', err);
    res.json([]);
  }
});

// List booking requests made by this user (so UI can show "Request sent" per specialist)
app.get('/api/users/:userId/booking-requests', async (req, res) => {
  const bearer = req.headers.authorization;
  const token = bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (String(payload.id) !== String(req.params.userId)) return res.status(403).json({ error: 'Forbidden' });
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT br.id, br.specialist_id, br.proposed_at, br.session_type, br.status, br.created_at
       FROM booking_requests br WHERE br.user_id = $1 ORDER BY br.created_at DESC`,
      [req.params.userId]
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      specialistId: String(rr.specialist_id),
      proposedAt: rr.proposed_at,
      sessionType: rr.session_type,
      status: rr.status,
      createdAt: rr.created_at,
    })));
  } catch (err) {
    console.error('GET /api/users/:userId/booking-requests', err);
    res.json([]);
  }
});

// User requests consultation with a specialist (creates booking_request)
app.post('/api/users/:userId/booking-request', async (req, res) => {
  const bearer = req.headers.authorization;
  const token = bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (String(payload.id) !== String(req.params.userId)) return res.status(403).json({ error: 'Forbidden' });
  const { specialistId, proposedAt, sessionType, message } = req.body || {};
  if (!specialistId || !proposedAt || !sessionType) return res.status(400).json({ error: 'specialistId, proposedAt and sessionType are required.' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const userR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1 AND role = $2', [req.params.userId, 'USER']);
    if (userR.rows.length === 0) return res.status(400).json({ error: 'Not a user account' });
    const spR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1 AND role IN (\'THERAPIST\',\'LIFE_COACH\',\'HYPNOTHERAPIST\',\'MUSIC_TUTOR\')', [specialistId]);
    if (spR.rows.length === 0) return res.status(404).json({ error: 'Specialist not found' });
    const proposed = new Date(proposedAt);
    if (isNaN(proposed.getTime())) return res.status(400).json({ error: 'Invalid proposedAt date.' });
    const insertCols = 'specialist_id, user_id, proposed_at, session_type, status';
    const insertVals = '$1, $2, $3, $4, \'PENDING\'';
    const params = [specialistId, req.params.userId, proposed, (sessionType || 'Consultation').toString().trim()];
    let colCount = 5;
    try {
      const msgCol = await db.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'message'");
      if (msgCol.rows.length > 0) {
        params.push((message || '').toString().trim().slice(0, 2000));
        colCount = 6;
      }
    } catch (_) {}
    const q = colCount === 6
      ? `INSERT INTO booking_requests (specialist_id, user_id, proposed_at, session_type, status, message) VALUES ($1, $2, $3, $4, 'PENDING', $5) RETURNING id`
      : `INSERT INTO booking_requests (specialist_id, user_id, proposed_at, session_type, status) VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id`;
    const ins = await db.query(q, params);
    const userName = userR.rows[0].name;
    const spName = spR.rows[0].name;
    await db.query("INSERT INTO activity_log (type, message) VALUES ('booking_request', $1)", [`${userName} requested consultation with ${spName} — ${(sessionType || 'Consultation').toString()}`]);
    res.status(201).json({ success: true, id: String(ins.rows[0].id), message: 'Request sent. The specialist will respond shortly.' });
  } catch (err) {
    console.error('POST /api/users/:userId/booking-request', err);
    res.status(500).json({ error: err.message });
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

app.get('/api/admin/applications/:id', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const r = await db.query('SELECT id, name, email, specialty, status, applied_at FROM specialist_applications WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    const rr = r.rows[0];
    res.json({ id: String(rr.id), name: rr.name, email: rr.email, specialty: rr.specialty, status: rr.status, appliedAt: rr.applied_at });
  } catch (err) {
    console.error('GET /api/admin/applications/:id', err);
    res.status(500).json({ error: err.message });
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

app.get('/api/admin/booking-requests', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT br.id, br.proposed_at, br.session_type, br.status, br.created_at,
        u.name as user_name, u.email as user_email,
        sp.name as specialist_name, sp.role as specialist_role
       FROM booking_requests br
       JOIN dashboard_users u ON u.id = br.user_id
       JOIN dashboard_users sp ON sp.id = br.specialist_id
       ORDER BY br.created_at DESC LIMIT 200`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      userName: rr.user_name,
      userEmail: rr.user_email,
      specialistName: rr.specialist_name,
      specialistRole: rr.specialist_role,
      proposedAt: rr.proposed_at,
      sessionType: rr.session_type,
      status: rr.status,
      createdAt: rr.created_at,
    })));
  } catch (err) {
    console.error('GET /api/admin/booking-requests', err);
    res.json([]);
  }
});

app.get('/api/admin/notifications', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json({ notifications: [], pendingApplications: 0, pendingBookingRequests: 0 });
  try {
    const [logR, appR, brR] = await Promise.all([
      db.query('SELECT id, type, message, created_at FROM activity_log ORDER BY created_at DESC LIMIT 50'),
      db.query("SELECT COUNT(*)::int as c FROM specialist_applications WHERE status = 'PENDING'"),
      db.query("SELECT COUNT(*)::int as c FROM booking_requests WHERE status = 'PENDING'"),
    ]);
    const pendingApplications = appR.rows[0]?.c || 0;
    const pendingBookingRequests = brR.rows[0]?.c || 0;
    const notifications = logR.rows.map(rr => {
      const d = rr.created_at ? new Date(rr.created_at) : new Date();
      const ts = (() => { const m = Math.round((Date.now() - d) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + ' min ago'; if (m < 1440) return Math.floor(m / 60) + ' hours ago'; return Math.floor(m / 1440) + ' days ago'; })();
      return {
        id: String(rr.id),
        type: rr.type || 'activity',
        title: (rr.type || 'activity').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        message: rr.message,
        timestamp: ts,
        createdAt: rr.created_at,
      };
    });
    res.json({ notifications, pendingApplications, pendingBookingRequests });
  } catch (err) {
    console.error('GET /api/admin/notifications', err);
    res.json({ notifications: [], pendingApplications: 0, pendingBookingRequests: 0 });
  }
});

app.get('/api/admin/users', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query("SELECT id, name, email, role, COALESCE(suspended, false) as suspended FROM dashboard_users WHERE role = 'USER' ORDER BY id");
    res.json(r.rows.map(rr => ({ id: String(rr.id), name: rr.name, email: rr.email, role: rr.role, suspended: !!rr.suspended })));
  } catch (err) {
    console.error('GET /api/admin/users', err);
    res.json([]);
  }
});

app.patch('/api/admin/users/:id/suspend', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  const { suspended } = req.body;
  if (typeof suspended !== 'boolean') return res.status(400).json({ error: 'suspended (boolean) required' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const target = await db.query('SELECT id, name, role FROM dashboard_users WHERE id = $1', [req.params.id]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (target.rows[0].role === 'ADMIN') return res.status(400).json({ error: 'Cannot suspend an admin' });
    await db.query('UPDATE dashboard_users SET suspended = $1 WHERE id = $2', [suspended, req.params.id]);
    await db.query("INSERT INTO activity_log (type, message) VALUES ('user_suspended', $1)", [`${target.rows[0].name} (${target.rows[0].role}) ${suspended ? 'suspended' : 'unsuspended'} by admin`]);
    res.json({ success: true, suspended });
  } catch (err) {
    console.error('PATCH /api/admin/users/:id/suspend', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/specialists', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT id, name, email, role, COALESCE(suspended, false) as suspended,
        (SELECT COUNT(*) FROM sessions WHERE specialist_id = dashboard_users.id AND status = 'COMPLETED') as session_count,
        (SELECT ROUND(AVG(rating)::numeric, 1) FROM sessions WHERE specialist_id = dashboard_users.id AND rating IS NOT NULL) as avg_rating
       FROM dashboard_users WHERE role IN ('THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR') ORDER BY name`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      name: rr.name,
      email: rr.email,
      specialty: rr.role,
      active: !rr.suspended,
      suspended: !!rr.suspended,
      sessionCount: parseInt(rr.session_count || 0, 10),
      rating: parseFloat(rr.avg_rating || 0) || 0,
    })));
  } catch (err) {
    console.error('GET /api/admin/specialists', err);
    res.json([]);
  }
});

app.post('/api/admin/specialists', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  const allowedRoles = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];
  const specialistRole = allowedRoles.includes(role) ? role : 'THERAPIST';
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const existing = await db.query('SELECT id FROM dashboard_users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'A user with this email already exists.' });
    const hash = await bcrypt.hash(password, 10);
    const uR = await db.query(
      'INSERT INTO dashboard_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name.trim(), email.trim().toLowerCase(), hash, specialistRole]
    );
    const row = uR.rows[0];
    await db.query("INSERT INTO activity_log (type, message) VALUES ('specialist_added', $1)", [`${row.name} (${row.email}) added as ${row.role} by admin`]);
    res.status(201).json({ id: String(row.id), name: row.name, email: row.email, role: row.role });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A user with this email already exists.' });
    console.error('POST /api/admin/specialists', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/messages', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT m.id, m.content, m.created_at, fu.name as from_name, fu.email as from_email, tu.name as to_name, tu.email as to_email
       FROM direct_messages m
       JOIN dashboard_users fu ON fu.id = m.from_user_id
       JOIN dashboard_users tu ON tu.id = m.to_user_id
       ORDER BY m.created_at DESC LIMIT 100`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      fromName: rr.from_name,
      fromEmail: rr.from_email,
      toName: rr.to_name,
      toEmail: rr.to_email,
      content: (rr.content || '').slice(0, 200),
      createdAt: rr.created_at,
    })));
  } catch (err) {
    console.error('GET /api/admin/messages', err);
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

app.get('/api/admin/users/:id/metrics', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  const userId = req.params.id;
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const userR = await db.query('SELECT id, name, email, role, healing_score, suspended FROM dashboard_users WHERE id = $1', [userId]);
    if (userR.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userR.rows[0];
    if (user.role !== 'USER') return res.status(400).json({ error: 'Not a user account' });
    const [sessionsR, moodR, specialistsR, upcomingR] = await Promise.all([
      db.query('SELECT COUNT(*) FILTER (WHERE status = \'COMPLETED\') as completed, COUNT(*) FILTER (WHERE status IN (\'UPCOMING\', \'IN_PROGRESS\') AND scheduled_at >= NOW()) as upcoming FROM sessions WHERE user_id = $1', [userId]),
      db.query('SELECT COALESCE(AVG(value), 0) as avg FROM mood_log WHERE user_id = $1 AND date >= CURRENT_DATE - 14', [userId]),
      db.query('SELECT sp.id, sp.name, sp.role, (SELECT COUNT(*) FROM sessions WHERE specialist_id = sp.id AND status = \'COMPLETED\') as sc FROM dashboard_users sp JOIN user_specialists us ON us.specialist_id = sp.id WHERE us.user_id = $1', [userId]),
      db.query('SELECT s.id, s.type, s.scheduled_at, s.duration_minutes, sp.name as specialist_name FROM sessions s JOIN dashboard_users sp ON sp.id = s.specialist_id WHERE s.user_id = $1 AND s.scheduled_at >= NOW() AND s.status IN (\'UPCOMING\', \'IN_PROGRESS\') ORDER BY s.scheduled_at ASC LIMIT 10', [userId]),
    ]);
    const sessionsCompleted = parseInt(sessionsR.rows[0]?.completed || 0, 10);
    const sessionsUpcoming = parseInt(sessionsR.rows[0]?.upcoming || 0, 10);
    const moodAverage = parseFloat(moodR.rows[0]?.avg || 0);
    res.json({
      user: { id: String(user.id), name: user.name, email: user.email, role: user.role, suspended: !!user.suspended },
      healingScore: user.healing_score || 0,
      metrics: { sessionsCompleted, sessionsUpcoming, moodAverage },
      specialists: specialistsR.rows.map(r => ({ id: String(r.id), name: r.name, role: r.role, sessionCount: parseInt(r.sc || 0, 10) })),
      upcomingSessions: upcomingR.rows.map(r => ({ id: String(r.id), type: r.type, scheduledAt: r.scheduled_at, durationMinutes: r.duration_minutes, specialistName: r.specialist_name })),
    });
  } catch (err) {
    console.error('GET /api/admin/users/:id/metrics', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/specialists/:id/metrics', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  const id = req.params.id;
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const spR = await db.query('SELECT id, name, email, role, suspended FROM dashboard_users WHERE id = $1 AND role IN (\'THERAPIST\', \'LIFE_COACH\', \'HYPNOTHERAPIST\', \'MUSIC_TUTOR\')', [id]);
    if (spR.rows.length === 0) return res.status(404).json({ error: 'Specialist not found' });
    const sp = spR.rows[0];
    const [clientsR, sessionsR, requestsR, todayR] = await Promise.all([
      db.query('SELECT u.id, u.name, COUNT(s.id) as session_count, MAX(s.scheduled_at)::date as last_date FROM dashboard_users u JOIN sessions s ON s.user_id = u.id AND s.specialist_id = $1 AND s.status = \'COMPLETED\' GROUP BY u.id, u.name', [id]),
      db.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'COMPLETED\') as completed FROM sessions WHERE specialist_id = $1', [id]),
      db.query('SELECT COUNT(*) as c FROM booking_requests WHERE specialist_id = $1 AND status = \'PENDING\'', [id]),
      db.query('SELECT s.id, s.type, s.scheduled_at, u.name as user_name FROM sessions s JOIN dashboard_users u ON u.id = s.user_id WHERE s.specialist_id = $1 AND s.scheduled_at::date = CURRENT_DATE AND s.status IN (\'UPCOMING\', \'IN_PROGRESS\') ORDER BY s.scheduled_at', [id]),
    ]);
    res.json({
      specialist: { id: String(sp.id), name: sp.name, email: sp.email, role: sp.role, suspended: !!sp.suspended },
      metrics: {
        totalSessions: parseInt(sessionsR.rows[0]?.total || 0, 10),
        completedSessions: parseInt(sessionsR.rows[0]?.completed || 0, 10),
        pendingRequests: parseInt(requestsR.rows[0]?.c || 0, 10),
        clientsCount: clientsR.rows.length,
      },
      clients: clientsR.rows.map(r => ({ id: String(r.id), name: r.name, sessionCount: parseInt(r.session_count || 0, 10), lastSessionDate: r.last_date })),
      todaySchedule: todayR.rows.map(r => ({ id: String(r.id), type: r.type, scheduledAt: r.scheduled_at, clientName: r.user_name })),
    });
  } catch (err) {
    console.error('GET /api/admin/specialists/:id/metrics', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/sessions', async (req, res) => {
  if (requireAdmin(req, res) === undefined) return;
  const { userId, specialistId, scheduledAt, sessionType, durationMinutes } = req.body || {};
  if (!userId || !specialistId || !scheduledAt) return res.status(400).json({ error: 'userId, specialistId and scheduledAt are required.' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const userR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1 AND role = \'USER\'', [userId]);
    const spR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1 AND role IN (\'THERAPIST\', \'LIFE_COACH\', \'HYPNOTHERAPIST\', \'MUSIC_TUTOR\')', [specialistId]);
    if (userR.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (spR.rows.length === 0) return res.status(404).json({ error: 'Specialist not found' });
    const at = new Date(scheduledAt);
    if (isNaN(at.getTime())) return res.status(400).json({ error: 'Invalid scheduledAt' });
    const dur = Math.min(120, Math.max(15, parseInt(durationMinutes, 10) || 50));
    const type = (sessionType || 'Session').toString().trim().slice(0, 100);
    await db.query('INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status) VALUES ($1, $2, $3, $4, $5, \'UPCOMING\')', [userId, specialistId, type, at, dur]);
    await db.query('INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, specialistId]);
    const adminId = 1;
    const dateStr = at.toLocaleDateString();
    const timeStr = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgToUser = `Your session has been scheduled by admin: ${dateStr} at ${timeStr} with ${spR.rows[0].name}. Type: ${type}.`;
    const msgToSpecialist = `Admin scheduled a session: ${dateStr} at ${timeStr} with ${userR.rows[0].name}. Type: ${type}.`;
    await db.query('INSERT INTO direct_messages (from_user_id, to_user_id, content) VALUES ($1, $2, $3), ($1, $4, $5)', [adminId, userId, msgToUser, specialistId, msgToSpecialist]);
    await db.query("INSERT INTO activity_log (type, message) VALUES ('session_scheduled', $1)", [`Admin scheduled session: ${userR.rows[0].name} with ${spR.rows[0].name} — ${type}`]);
    res.status(201).json({ success: true, message: 'Session scheduled. Both parties have been notified via messaging.' });
  } catch (err) {
    console.error('POST /api/admin/sessions', err);
    res.status(500).json({ error: err.message });
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
       WHERE u.role IN ('THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR') AND (u.suspended IS NULL OR u.suspended = false)
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
       GROUP BY u.id, u.name`,
      [id]
    );
    const notesR = await db.query(
      `SELECT n.id, n.content, n.created_at, u.name as client_name FROM session_notes n JOIN dashboard_users u ON u.id = n.user_id WHERE n.specialist_id = $1 ORDER BY n.created_at DESC LIMIT 10`,
      [id]
    );
    const requestsR = await db.query(
      `SELECT br.id, br.user_id, br.proposed_at, br.session_type, br.created_at, br.message,
              u.name as client_name, u.email as client_email
       FROM booking_requests br
       JOIN dashboard_users u ON u.id = br.user_id
       WHERE br.specialist_id = $1 AND br.status = 'PENDING'
       ORDER BY br.created_at DESC`,
      [id]
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
      userId: String(r.user_id),
      clientName: r.client_name,
      clientEmail: r.client_email || '',
      requestedAt: r.created_at ? new Date(r.created_at).toISOString() : '',
      proposedTime: r.proposed_at ? new Date(r.proposed_at).toLocaleString() : '',
      sessionType: r.session_type,
      message: r.message || '',
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
      `SELECT br.id, br.user_id, br.proposed_at, br.session_type, br.created_at, br.message,
        u.name as client_name, u.email as client_email
       FROM booking_requests br JOIN dashboard_users u ON u.id = br.user_id WHERE br.specialist_id = $1 AND br.status = 'PENDING' ORDER BY br.created_at DESC`
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      userId: String(rr.user_id),
      clientName: rr.client_name,
      clientEmail: rr.client_email,
      requestedAt: rr.created_at ? new Date(rr.created_at).toISOString() : '',
      proposedTime: rr.proposed_at ? new Date(rr.proposed_at).toLocaleString() : '',
      sessionType: rr.session_type,
      message: rr.message || '',
    })));
  } catch (err) {
    console.error('GET /api/specialists/:id/requests', err);
    res.json([]);
  }
});

app.patch('/api/specialists/:id/requests/:requestId', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (String(payload.id) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body;
  if (!status || !['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const newStatus = status.toLowerCase() === 'accepted' ? 'ACCEPTED' : 'DECLINED';
    const brR = await db.query('SELECT id, user_id, specialist_id, proposed_at, session_type FROM booking_requests WHERE id = $1 AND specialist_id = $2', [req.params.requestId, req.params.id]);
    if (brR.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    const br = brR.rows[0];
    if (newStatus === 'ACCEPTED') {
      await db.query(
        `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status) VALUES ($1, $2, $3, $4, 50, 'UPCOMING')`,
        [br.user_id, br.specialist_id, br.session_type || 'Consultation', br.proposed_at]
      );
      await db.query('INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [br.user_id, br.specialist_id]);
      const uR = await db.query('SELECT name FROM dashboard_users WHERE id = $1', [br.user_id]);
      const spR = await db.query('SELECT name FROM dashboard_users WHERE id = $1', [br.specialist_id]);
      await db.query("INSERT INTO activity_log (type, message) VALUES ('booking_accepted', $1)", [`${spR.rows[0]?.name || 'Specialist'} accepted consultation request from ${uR.rows[0]?.name || 'Client'} — session scheduled`]);
    } else {
      await db.query("INSERT INTO activity_log (type, message) VALUES ('booking_declined', $1)", [`Consultation request #${req.params.requestId} declined by specialist`]);
    }
    await db.query('UPDATE booking_requests SET status = $1 WHERE id = $2 AND specialist_id = $3', [newStatus, req.params.requestId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/specialists/:id/requests/:requestId', err);
    res.status(500).json({ error: err.message });
  }
});

// Therapist schedules a session with a client (manual schedule meeting)
app.post('/api/specialists/:id/sessions', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (String(payload.id) !== String(req.params.id)) return res.status(403).json({ error: 'Forbidden' });
  const { userId, scheduledAt, sessionType, durationMinutes } = req.body || {};
  if (!userId || !scheduledAt) return res.status(400).json({ error: 'userId and scheduledAt are required.' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const spR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1 AND role IN (\'THERAPIST\',\'LIFE_COACH\',\'HYPNOTHERAPIST\',\'MUSIC_TUTOR\')', [req.params.id]);
    if (spR.rows.length === 0) return res.status(404).json({ error: 'Specialist not found' });
    const uR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1 AND role = $2', [userId, 'USER']);
    if (uR.rows.length === 0) return res.status(400).json({ error: 'Client not found' });
    const at = new Date(scheduledAt);
    if (isNaN(at.getTime())) return res.status(400).json({ error: 'Invalid scheduledAt' });
    const dur = Math.min(120, Math.max(15, parseInt(durationMinutes, 10) || 50));
    const type = (sessionType || 'Consultation').toString().trim().slice(0, 100);
    await db.query(
      `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status) VALUES ($1, $2, $3, $4, $5, 'UPCOMING')`,
      [userId, req.params.id, type, at, dur]
    );
    await db.query('INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, req.params.id]);
    await db.query("INSERT INTO activity_log (type, message) VALUES ('session_scheduled', $1)", [`${spR.rows[0].name} scheduled session with ${uR.rows[0].name} — ${type}`]);
    res.status(201).json({ success: true, message: 'Session scheduled.' });
  } catch (err) {
    console.error('POST /api/specialists/:id/sessions', err);
    res.status(500).json({ error: err.message });
  }
});

// Send a direct message (therapist to client or client to therapist)
app.post('/api/messages', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  const { toUserId, content } = req.body || {};
  if (!toUserId || !content || typeof content !== 'string') return res.status(400).json({ error: 'toUserId and content are required.' });
  const text = content.trim().slice(0, 5000);
  if (!text) return res.status(400).json({ error: 'Content cannot be empty.' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  try {
    const toR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1', [toUserId]);
    if (toR.rows.length === 0) return res.status(404).json({ error: 'Recipient not found' });
    const fromR = await db.query('SELECT id, name FROM dashboard_users WHERE id = $1', [payload.id]);
    await db.query('INSERT INTO direct_messages (from_user_id, to_user_id, content) VALUES ($1, $2, $3)', [payload.id, toUserId, text]);
    await db.query("INSERT INTO activity_log (type, message) VALUES ('message_sent', $1)", [`${fromR.rows[0]?.name || 'User'} sent message to ${toR.rows[0]?.name || 'User'}`]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/messages', err);
    res.status(500).json({ error: err.message });
  }
});

// Get message thread between current user and another user
app.get('/api/messages', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  const withUserId = req.query.with;
  if (!withUserId) return res.status(400).json({ error: 'Query parameter "with" (userId) is required.' });
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.created_at, u.name as from_name
       FROM direct_messages m JOIN dashboard_users u ON u.id = m.from_user_id
       WHERE (m.from_user_id = $1 AND m.to_user_id = $2) OR (m.from_user_id = $2 AND m.to_user_id = $1)
       ORDER BY m.created_at ASC`,
      [payload.id, withUserId]
    );
    res.json(r.rows.map(rr => ({
      id: String(rr.id),
      fromUserId: String(rr.from_user_id),
      toUserId: String(rr.to_user_id),
      fromName: rr.from_name,
      content: rr.content,
      createdAt: rr.created_at,
      isFromMe: String(rr.from_user_id) === String(payload.id),
    })));
  } catch (err) {
    console.error('GET /api/messages', err);
    res.json([]);
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

// ---------- Dev: seed testuser1 — fully self-contained, every op wrapped ----------
async function seedTestUser1() {
  if (!db.connected) return { ok: false, error: 'Database not connected' };
  const log = [];
  const safe = async (label, fn) => {
    try { await fn(); log.push(`OK: ${label}`); }
    catch (e) { log.push(`FAIL: ${label} — ${e.message}`); }
  };

  // 1. Ensure testuser1 exists (create if missing, update if exists)
  await safe('upsert testuser1', async () => {
    const hash = await bcrypt.hash('TestUser@123', 10);
    const exists = await db.query("SELECT id FROM dashboard_users WHERE email = 'testuser1@test.btb.fit'");
    if (exists.rows.length === 0) {
      await db.query(
        "INSERT INTO dashboard_users (name, email, password_hash, role, healing_score) VALUES ('Test User One', 'testuser1@test.btb.fit', $1, 'USER', 74)",
        [hash]
      );
    } else {
      await db.query(
        "UPDATE dashboard_users SET healing_score = 74, password_hash = $1 WHERE email = 'testuser1@test.btb.fit'",
        [hash]
      );
    }
  });

  // Get uid (abort if still not found)
  let uid;
  try {
    const r = await db.query("SELECT id FROM dashboard_users WHERE email = 'testuser1@test.btb.fit'");
    if (r.rows.length === 0) return { ok: false, error: 'Could not create testuser1', log };
    uid = r.rows[0].id;
  } catch (e) { return { ok: false, error: e.message, log }; }

  // 2. Lookup specialist IDs by email (don't hardcode IDs)
  let specialistIds = [];
  await safe('find specialists', async () => {
    const r = await db.query(
      "SELECT id FROM dashboard_users WHERE role IN ('THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR') ORDER BY id"
    );
    specialistIds = r.rows.map(x => x.id);
  });
  if (specialistIds.length === 0) {
    log.push('WARN: no specialists found — creating them');
    await safe('create specialists', async () => {
      const h = await bcrypt.hash('Therapist@BTB2026', 10);
      for (const sp of [
        { name: 'Dr. Sarah Chen', email: 'sarah@btb.fit', role: 'THERAPIST' },
        { name: 'James Miller', email: 'james@btb.fit', role: 'LIFE_COACH' },
        { name: 'Maya Foster', email: 'maya@btb.fit', role: 'HYPNOTHERAPIST' },
        { name: 'Leo Torres', email: 'leo@btb.fit', role: 'MUSIC_TUTOR' },
      ]) {
        await db.query(
          'INSERT INTO dashboard_users (name, email, password_hash, role, healing_score) VALUES ($1, $2, $3, $4, 0) ON CONFLICT (email) DO NOTHING',
          [sp.name, sp.email, h, sp.role]
        );
      }
      const r2 = await db.query("SELECT id FROM dashboard_users WHERE role IN ('THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR') ORDER BY id");
      specialistIds = r2.rows.map(x => x.id);
    });
  }
  if (specialistIds.length === 0) return { ok: false, error: 'No specialists in DB after creation attempt', log };

  // 3. Link user to all specialists
  await safe('link specialists', async () => {
    for (const sid of specialistIds) {
      await db.query(
        'INSERT INTO user_specialists (user_id, specialist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [uid, sid]
      );
    }
  });

  // 4. Ensure at least 10 completed sessions exist
  await safe('completed sessions', async () => {
    const cr = await db.query("SELECT COUNT(*)::int as c FROM sessions WHERE user_id = $1 AND status = 'COMPLETED'", [uid]);
    const have = cr.rows[0].c;
    const now = new Date();
    const types = ['1:1 Therapy', 'Coaching', 'Hypnosis', 'Mindfulness', 'Follow-up', 'Deep Dive', 'Check-in'];
    for (let i = have; i < 10; i++) {
      const d = new Date(now); d.setDate(d.getDate() - (7 + i * 4)); d.setHours(10 + (i % 3), 0, 0, 0);
      await db.query(
        `INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status, completed_at, rating)
         VALUES ($1, $2, $3, $4, 50, 'COMPLETED', $4, $5)`,
        [uid, specialistIds[i % specialistIds.length], types[i % types.length], d, 4 + (i % 2)]
      );
    }
  });

  // 5. Delete stale upcoming, add 4 fresh future sessions
  await safe('upcoming sessions', async () => {
    await db.query("DELETE FROM sessions WHERE user_id = $1 AND status = 'UPCOMING' AND scheduled_at < NOW()", [uid]);
    const cr = await db.query("SELECT COUNT(*)::int as c FROM sessions WHERE user_id = $1 AND status = 'UPCOMING' AND scheduled_at >= NOW()", [uid]);
    const have = cr.rows[0].c;
    const now = new Date();
    const labels = ['1:1 Therapy', 'Coaching', 'Hypnosis', 'Mindfulness'];
    for (let i = have; i < 4; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i + 1); d.setHours(10 + i, 0, 0, 0);
      await db.query(
        "INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status) VALUES ($1, $2, $3, $4, 50, 'UPCOMING')",
        [uid, specialistIds[i % specialistIds.length], labels[i % labels.length], d]
      );
    }
  });

  // 6. Mood log — 30 days
  await safe('mood log', async () => {
    const now = new Date();
    for (let d = 0; d < 30; d++) {
      const dte = new Date(now); dte.setDate(dte.getDate() - d);
      const dateStr = dte.toISOString().slice(0, 10);
      const val = d < 7 ? 6 + (d % 3) : (5 + Math.floor(Math.random() * 4));
      const note = ['Feeling calm', 'Good sleep', 'Productive day', 'Mindful morning', 'Grateful', null][d % 6];
      await db.query(
        'INSERT INTO mood_log (user_id, date, value, note) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, date) DO UPDATE SET value = $3, note = $4',
        [uid, dateStr, val, note]
      );
    }
  });

  // 7. Milestones (find actual milestone IDs from DB, don't hardcode)
  await safe('milestones', async () => {
    const mr = await db.query('SELECT id FROM milestones ORDER BY id LIMIT 3');
    for (const m of mr.rows) {
      await db.query(
        'INSERT INTO user_milestones (user_id, milestone_id, unlocked_at) VALUES ($1, $2, CURRENT_DATE - (RANDOM() * 60)::int) ON CONFLICT DO NOTHING',
        [uid, m.id]
      );
    }
  });

  // 8. Community posts (only if few exist)
  await safe('community posts', async () => {
    const cr = await db.query('SELECT COUNT(*)::int as c FROM community_posts WHERE user_id = $1', [uid]);
    if (cr.rows[0].c < 3) {
      for (const content of [
        'Grateful for this community. Small steps add up.',
        '10 sessions in — the consistency is paying off.',
        'Hit my 7-day streak today. The reminders help.',
        'Morning meditation is game-changing. Share your routine!',
        'Shared my first milestone. The support here is real.',
      ]) {
        await db.query(
          'INSERT INTO community_posts (user_id, content, likes, comments) VALUES ($1, $2, $3, $4)',
          [uid, content, 5 + Math.floor(Math.random() * 20), 1 + Math.floor(Math.random() * 5)]
        );
      }
    }
  });

  // 9. Session notes + reviews for completed sessions
  await safe('notes and reviews', async () => {
    const sessR = await db.query(
      "SELECT s.id, s.specialist_id FROM sessions s LEFT JOIN session_notes sn ON sn.session_id = s.id WHERE s.user_id = $1 AND s.status = 'COMPLETED' AND sn.id IS NULL LIMIT 6",
      [uid]
    );
    const noteTexts = ['Great progress today.', 'Explored breathing techniques.', 'Set action steps for the week.', 'Reflected on wins.', 'Reviewed homework.', 'Breakthrough moment.'];
    const reviewTexts = ['Life-changing support.', 'So grateful.', 'Always feel heard.', 'Best decision I made.', 'Progress I never expected.', 'Thank you for the safe space.'];
    for (let i = 0; i < sessR.rows.length; i++) {
      const s = sessR.rows[i];
      await db.query('INSERT INTO session_notes (session_id, specialist_id, user_id, content, is_private) VALUES ($1, $2, $3, $4, true)', [s.id, s.specialist_id, uid, noteTexts[i % noteTexts.length]]);
      await db.query('INSERT INTO reviews (session_id, user_id, specialist_id, rating, excerpt) VALUES ($1, $2, $3, 5, $4)', [s.id, uid, s.specialist_id, reviewTexts[i % reviewTexts.length]]);
    }
  });

  console.log('seedTestUser1:', log.join(' | '));
  const failures = log.filter(l => l.startsWith('FAIL'));
  return { ok: failures.length === 0, uid, log, failures: failures.length };
}

app.get('/api/dev/seed-testuser1', async (req, res) => {
  const result = await seedTestUser1();
  res.json(result);
});

app.get('/api/dev/debug-testuser1', async (req, res) => {
  if (!db.connected) return res.json({ error: 'DB not connected' });
  try {
    const user = await db.query("SELECT id, name, email, role, healing_score FROM dashboard_users WHERE email = 'testuser1@test.btb.fit'");
    if (user.rows.length === 0) return res.json({ error: 'testuser1 not found in DB' });
    const uid = user.rows[0].id;
    const sessions = await db.query('SELECT COUNT(*)::int as c FROM sessions WHERE user_id = $1', [uid]);
    const completed = await db.query("SELECT COUNT(*)::int as c FROM sessions WHERE user_id = $1 AND status = 'COMPLETED'", [uid]);
    const upcoming = await db.query("SELECT COUNT(*)::int as c FROM sessions WHERE user_id = $1 AND status = 'UPCOMING' AND scheduled_at >= NOW()", [uid]);
    const mood = await db.query('SELECT COUNT(*)::int as c FROM mood_log WHERE user_id = $1', [uid]);
    const posts = await db.query('SELECT COUNT(*)::int as c FROM community_posts WHERE user_id = $1', [uid]);
    const milestones = await db.query('SELECT COUNT(*)::int as c FROM user_milestones WHERE user_id = $1', [uid]);
    const specialists = await db.query('SELECT COUNT(*)::int as c FROM user_specialists WHERE user_id = $1', [uid]);
    const allSpecialists = await db.query("SELECT id, name, role FROM dashboard_users WHERE role IN ('THERAPIST','LIFE_COACH','HYPNOTHERAPIST','MUSIC_TUTOR')");
    const allMilestones = await db.query('SELECT id, title FROM milestones ORDER BY id');
    res.json({
      user: user.rows[0],
      counts: {
        totalSessions: sessions.rows[0].c,
        completedSessions: completed.rows[0].c,
        upcomingSessions: upcoming.rows[0].c,
        moodEntries: mood.rows[0].c,
        communityPosts: posts.rows[0].c,
        milestones: milestones.rows[0].c,
        linkedSpecialists: specialists.rows[0].c,
      },
      specialists: allSpecialists.rows,
      milestonesInDb: allMilestones.rows,
    });
  } catch (e) { res.json({ error: e.message }); }
});

// ─── PHASE 1 FEATURE ROUTES ──────────────────────────────────────────────────

// Helper: calculate week_start (Sunday)
function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

// FEATURE 1 — Wellness Score
app.get('/api/wellness-score', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.json({ score: 0, label: 'Just Starting', components: [] });
  try {
    const userId = payload.id;
    const [moodData, sessionData, tipData] = await Promise.all([
      db.query(
        `SELECT AVG(value) as avg_mood FROM mood_log
         WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [userId]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
           COUNT(*) AS total
         FROM sessions
         WHERE user_id = $1 AND scheduled_at >= NOW() - INTERVAL '30 days'`,
        [userId]
      ),
      db.query(
        `SELECT COALESCE(brain_tips_practiced, 0) AS tips FROM dashboard_users WHERE id = $1`,
        [userId]
      ),
    ]);

    // Streak: count consecutive days with mood_log entries up to today
    const streakData = await db.query(
      `WITH days AS (
         SELECT date FROM mood_log WHERE user_id = $1 ORDER BY date DESC
       ),
       numbered AS (
         SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) AS rn FROM days
       )
       SELECT COUNT(*)::int AS streak FROM numbered
       WHERE date = CURRENT_DATE - (rn - 1) * INTERVAL '1 day'`,
      [userId]
    );

    const avgMood    = parseFloat(moodData.rows[0]?.avg_mood || '0');
    const completed  = parseInt(sessionData.rows[0]?.completed || '0');
    const total      = parseInt(sessionData.rows[0]?.total || '1');
    const streak     = parseInt(streakData.rows[0]?.streak || '0');
    const tips       = parseInt(tipData.rows[0]?.tips || '0');

    const moodComp    = Math.min(100, Math.round((avgMood / 10) * 100));
    const sessionComp = Math.min(100, Math.round((completed / Math.max(total, 1)) * 100));
    const streakComp  = Math.min(100, Math.round((Math.min(streak, 30) / 30) * 100));
    const tipsComp    = Math.min(100, Math.round((Math.min(tips, 30) / 30) * 100));

    const score = Math.round(
      moodComp * 0.30 + sessionComp * 0.30 + streakComp * 0.20 + tipsComp * 0.20
    );
    const label =
      score >= 80 ? 'Thriving' :
      score >= 60 ? 'Growing'  :
      score >= 40 ? 'Healing'  :
      score >= 20 ? 'Beginning': 'Just Starting';

    res.json({
      score, label,
      components: [
        { label: 'Mood',       value: moodComp,    weight: '30%' },
        { label: 'Sessions',   value: sessionComp, weight: '30%' },
        { label: 'Streak',     value: streakComp,  weight: '20%' },
        { label: 'Brain Tips', value: tipsComp,    weight: '20%' },
      ],
    });
  } catch (err) {
    console.error('GET /api/wellness-score', err);
    res.json({ score: 0, label: 'Just Starting', components: [] });
  }
});

// FEATURE 2 — Session Recaps
app.get('/api/session-recaps', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT
         sr.*,
         s.scheduled_at,
         therapist.name  AS therapist_name,
         next_s.scheduled_at AS next_session_at
       FROM session_recaps sr
       LEFT JOIN sessions s          ON sr.session_id   = s.id
       LEFT JOIN dashboard_users therapist ON sr.therapist_id = therapist.id
       LEFT JOIN LATERAL (
         SELECT scheduled_at FROM sessions
         WHERE  user_id = sr.user_id
           AND  status  IN ('UPCOMING','scheduled')
           AND  scheduled_at > NOW()
         ORDER BY scheduled_at ASC LIMIT 1
       ) next_s ON TRUE
       WHERE sr.user_id      = $1
         AND sr.is_dismissed = FALSE
       ORDER BY sr.created_at DESC
       LIMIT 3`,
      [payload.id]
    );
    res.json(r.rows);
  } catch (err) {
    console.error('GET /api/session-recaps', err);
    res.json([]);
  }
});

app.post('/api/session-recaps', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  const { session_id, user_id, takeaways, homework, recommended_brain_tip, therapist_note } = req.body || {};
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    const r = await db.query(
      `INSERT INTO session_recaps
         (session_id, user_id, therapist_id, takeaways, homework, recommended_brain_tip, therapist_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [session_id || null, user_id, payload.id,
       takeaways || [], homework || [],
       recommended_brain_tip || null, therapist_note || null]
    );
    res.json(r.rows[0]);
  } catch (err) {
    console.error('POST /api/session-recaps', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/session-recaps', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    await db.query(
      `UPDATE session_recaps SET is_dismissed = TRUE WHERE id = $1 AND user_id = $2`,
      [id, payload.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/session-recaps', err);
    res.status(500).json({ error: err.message });
  }
});

// FEATURE 3 — Body Bank Sync
app.get('/api/bodybank', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.json({ connected: false });
  try {
    const userResult = await db.query(
      `SELECT bodybank_user_id, bodybank_access_token FROM dashboard_users WHERE id = $1`,
      [payload.id]
    );
    const user = userResult.rows[0];
    if (!user?.bodybank_user_id) return res.json({ connected: false });

    const cacheResult = await db.query(
      `SELECT * FROM bodybank_sync WHERE user_id = $1 ORDER BY synced_at DESC LIMIT 1`,
      [payload.id]
    );
    const cached = cacheResult.rows[0];
    const isStale = !cached ||
      new Date(cached.synced_at) < new Date(Date.now() - 60 * 60 * 1000);

    if (!isStale && cached) {
      return res.json({
        connected: true,
        nutrition: cached.nutrition_score, recovery: cached.recovery_score,
        fitness: cached.fitness_score,     hydration: cached.hydration_score,
        synced_at: cached.synced_at,
      });
    }

    const bbApiUrl = process.env.BODYBANK_API_URL || 'https://api.bodybank.fit/v1';
    try {
      const bbRes = await fetch(
        `${bbApiUrl}/user/${user.bodybank_user_id}/scores`,
        { headers: { Authorization: `Bearer ${user.bodybank_access_token}` } }
      );
      if (!bbRes.ok) throw new Error('Body Bank API error');
      const bbData = await bbRes.json();
      await db.query(
        `INSERT INTO bodybank_sync
           (user_id, nutrition_score, recovery_score, fitness_score, hydration_score, raw_data)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [payload.id, bbData.nutrition, bbData.recovery,
         bbData.fitness, bbData.hydration, JSON.stringify(bbData)]
      );
      return res.json({
        connected: true,
        nutrition: bbData.nutrition, recovery: bbData.recovery,
        fitness: bbData.fitness,     hydration: bbData.hydration,
        synced_at: new Date(),
      });
    } catch {
      if (cached) return res.json({
        connected: true,
        nutrition: cached.nutrition_score, recovery: cached.recovery_score,
        fitness: cached.fitness_score,     hydration: cached.hydration_score,
        synced_at: cached.synced_at, stale: true,
      });
      return res.json({ connected: true, error: 'Sync failed' });
    }
  } catch (err) {
    console.error('GET /api/bodybank', err);
    res.json({ connected: false });
  }
});

// FEATURE 4 — Mood Pattern Insights
app.get('/api/mood-insights', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ insights: [] });
  if (!db.connected || !(await hasDashboard())) return res.json({ insights: [] });
  try {
    const userId = payload.id;
    const [moodLogs, sessionDates] = await Promise.all([
      db.query(
        `SELECT value AS mood_value, date::text AS logged_at,
                EXTRACT(DOW FROM date) AS day_of_week
         FROM mood_log
         WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '60 days'
         ORDER BY date ASC`,
        [userId]
      ),
      db.query(
        `SELECT DATE(scheduled_at)::text AS session_date
         FROM sessions
         WHERE user_id = $1 AND status = 'COMPLETED'
           AND scheduled_at >= NOW() - INTERVAL '60 days'`,
        [userId]
      ),
    ]);

    const logs = moodLogs.rows;
    const sessionDays = new Set(sessionDates.rows.map(r => r.session_date));
    const insights = [];

    if (logs.length < 5) {
      return res.json({
        insights: ['Log your mood for 5 or more days to unlock your personal patterns.'],
      });
    }

    // Best / worst day of week
    const dayMoods = {};
    logs.forEach(l => {
      const d = Number(l.day_of_week);
      dayMoods[d] = dayMoods[d] || [];
      dayMoods[d].push(Number(l.mood_value));
    });
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayAvgs = Object.entries(dayMoods)
      .filter(([, v]) => v.length >= 2)
      .map(([d, v]) => ({ day: parseInt(d), avg: v.reduce((a,b)=>a+b,0)/v.length }));
    if (dayAvgs.length >= 3) {
      const best  = dayAvgs.reduce((a,b) => a.avg > b.avg ? a : b);
      const worst = dayAvgs.reduce((a,b) => a.avg < b.avg ? a : b);
      if (best.avg - worst.avg > 1.0)
        insights.push(`You feel best on ${dayNames[best.day]}s and tend to dip on ${dayNames[worst.day]}s.`);
    }

    // Mood after sessions
    if (sessionDays.size >= 3) {
      const after = [], normal = [];
      logs.forEach(l => {
        const prev = new Date(l.logged_at);
        prev.setDate(prev.getDate() - 1);
        sessionDays.has(prev.toISOString().split('T')[0])
          ? after.push(Number(l.mood_value))
          : normal.push(Number(l.mood_value));
      });
      if (after.length >= 2 && normal.length >= 2) {
        const avgA = after.reduce((a,b)=>a+b,0)/after.length;
        const avgN = normal.reduce((a,b)=>a+b,0)/normal.length;
        const diff = Math.round(((avgA - avgN) / Math.max(avgN, 1)) * 100);
        if (diff >= 10)
          insights.push(`Your mood is ${diff}% higher on days after a therapy session.`);
        else if (diff <= -10)
          insights.push(`Your mood tends to be lower after sessions — this is normal during deep healing.`);
      }
    }

    // Weekly trend
    if (logs.length >= 14) {
      const r = logs.slice(-7).map(l => Number(l.mood_value));
      const o = logs.slice(-14,-7).map(l => Number(l.mood_value));
      const rA = r.reduce((a,b)=>a+b,0)/r.length;
      const oA = o.reduce((a,b)=>a+b,0)/o.length;
      const td = Math.round(rA - oA);
      if (td >= 1) insights.push(`Your mood has trended up ${td} point${td>1?'s':''} this week. Keep going.`);
      else if (td <= -1) insights.push(`Your mood dipped slightly this week. A session might help.`);
    }

    res.json({ insights: insights.slice(0, 2) });
  } catch (err) {
    console.error('GET /api/mood-insights', err);
    res.json({ insights: [] });
  }
});

// FEATURE 5 — Healing Goals
app.get('/api/healing-goals', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.json([]);
  try {
    const r = await db.query(
      `SELECT hg.*,
         COALESCE(
           json_agg(gp ORDER BY gp.logged_at DESC)
             FILTER (WHERE gp.id IS NOT NULL),
           '[]'::json
         ) AS progress_history
       FROM healing_goals hg
       LEFT JOIN goal_progress gp ON hg.id = gp.goal_id
       WHERE hg.user_id = $1 AND hg.is_active = TRUE
       GROUP BY hg.id
       ORDER BY hg.created_at ASC
       LIMIT 3`,
      [payload.id]
    );
    res.json(r.rows);
  } catch (err) {
    console.error('GET /api/healing-goals', err);
    res.json([]);
  }
});

app.post('/api/healing-goals', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  const { title, category } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title required' });
  try {
    const count = await db.query(
      `SELECT COUNT(*)::int AS c FROM healing_goals WHERE user_id = $1 AND is_active = TRUE`,
      [payload.id]
    );
    if (count.rows[0].c >= 3)
      return res.status(400).json({ error: 'Maximum 3 active goals allowed' });
    const r = await db.query(
      `INSERT INTO healing_goals (user_id, title, category) VALUES ($1,$2,$3) RETURNING *`,
      [payload.id, title.trim(), category || 'general']
    );
    res.json(r.rows[0]);
  } catch (err) {
    console.error('POST /api/healing-goals', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/healing-goals', async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (!db.connected || !(await hasDashboard())) return res.status(503).json({ error: 'Not configured' });
  const body = req.body || {};
  try {
    if (body.action === 'log_progress') {
      await db.query(
        `INSERT INTO goal_progress (goal_id, user_id, rating, week_start)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (goal_id, week_start) DO UPDATE SET rating = EXCLUDED.rating`,
        [body.goal_id, payload.id, body.rating, getWeekStart()]
      );
      return res.json({ success: true });
    }
    if (body.action === 'deactivate') {
      await db.query(
        `UPDATE healing_goals SET is_active = FALSE WHERE id = $1 AND user_id = $2`,
        [body.goal_id, payload.id]
      );
      return res.json({ success: true });
    }
    res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('PATCH /api/healing-goals', err);
    res.status(500).json({ error: err.message });
  }
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
      CREATE TABLE IF NOT EXISTS direct_messages (
        id            SERIAL PRIMARY KEY,
        from_user_id  INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        to_user_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        content       TEXT NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_specialist ON sessions(specialist_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_scheduled  ON sessions(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_status     ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_mood_log_user_date  ON mood_log(user_id, date DESC);
      CREATE INDEX IF NOT EXISTS idx_community_created   ON community_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_created    ON activity_log(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_dm_from_to          ON direct_messages(from_user_id, to_user_id);
      CREATE INDEX IF NOT EXISTS idx_dm_created         ON direct_messages(created_at DESC);
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
    try {
      await db.query('ALTER TABLE dashboard_users ADD COLUMN suspended BOOLEAN DEFAULT FALSE');
    } catch (e) {
      if (e.code !== '42701') throw e;
    }
    try {
      await db.query('ALTER TABLE booking_requests ADD COLUMN message TEXT');
    } catch (e) {
      if (e.code !== '42701') throw e;
    }

    // Phase 1 feature columns on dashboard_users
    for (const col of [
      'brain_tips_practiced INTEGER DEFAULT 0',
      'brain_tips_practiced_dates JSONB DEFAULT \'[]\'',
      'bodybank_user_id VARCHAR(255)',
      'bodybank_access_token TEXT',
      'bodybank_token_expires_at TIMESTAMPTZ',
    ]) {
      try {
        await db.query(`ALTER TABLE dashboard_users ADD COLUMN ${col}`);
      } catch (e) {
        if (e.code !== '42701') throw e;
      }
    }

    // Phase 1 tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS wellness_scores (
        id            SERIAL PRIMARY KEY,
        user_id       INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        score         INT NOT NULL CHECK (score BETWEEN 0 AND 100),
        mood_component     INT,
        session_component  INT,
        streak_component   INT,
        tips_component     INT,
        calculated_at TIMESTAMPTZ DEFAULT NOW(),
        week_start    DATE NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_wellness_scores_user_week ON wellness_scores(user_id, week_start DESC);

      CREATE TABLE IF NOT EXISTS session_recaps (
        id                    SERIAL PRIMARY KEY,
        session_id            INT REFERENCES sessions(id) ON DELETE CASCADE,
        user_id               INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        therapist_id          INT REFERENCES dashboard_users(id),
        takeaways             TEXT[] DEFAULT '{}',
        homework              TEXT[] DEFAULT '{}',
        recommended_brain_tip VARCHAR(200),
        therapist_note        TEXT,
        is_dismissed          BOOLEAN DEFAULT FALSE,
        created_at            TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_session_recaps_user ON session_recaps(user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS bodybank_sync (
        id               SERIAL PRIMARY KEY,
        user_id          INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        nutrition_score  INT,
        recovery_score   INT,
        fitness_score    INT,
        hydration_score  INT,
        raw_data         JSONB,
        synced_at        TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_bodybank_sync_user ON bodybank_sync(user_id, synced_at DESC);

      CREATE TABLE IF NOT EXISTS healing_goals (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        title      VARCHAR(200) NOT NULL,
        category   VARCHAR(50) DEFAULT 'general',
        is_active  BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_healing_goals_user ON healing_goals(user_id);

      CREATE TABLE IF NOT EXISTS goal_progress (
        id         SERIAL PRIMARY KEY,
        goal_id    INT NOT NULL REFERENCES healing_goals(id) ON DELETE CASCADE,
        user_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        note       TEXT,
        logged_at  TIMESTAMPTZ DEFAULT NOW(),
        week_start DATE NOT NULL,
        CONSTRAINT goal_progress_goal_week_unique UNIQUE (goal_id, week_start)
      );
      CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON goal_progress(goal_id, logged_at DESC);

      CREATE TABLE IF NOT EXISTS journal_entries (
        id           SERIAL PRIMARY KEY,
        user_id      INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
        gratitude_1  TEXT,
        gratitude_2  TEXT,
        gratitude_3  TEXT,
        intention    TEXT,
        mood_at_entry INT,
        entry_date   DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, entry_date)
      );
      CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id, entry_date DESC);
    `);

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

    // 5. Seed testuser1 with full presentation data (bulletproof — each step wrapped)
    const seedResult = await seedTestUser1();
    console.log('autoMigrate: seedTestUser1 =>', JSON.stringify(seedResult));

    // 6. Extra seed data (specialist applications, activity log) — each wrapped
    try {
      const appCount = await db.query("SELECT COUNT(*)::int as c FROM specialist_applications WHERE email IN ('elena.v@example.com','marcus.r@example.com','priya.s@example.com')");
      if (appCount.rows[0].c === 0) {
        await db.query(
          `INSERT INTO specialist_applications (name, email, specialty, status) VALUES
           ('Elena Vasquez', 'elena.v@example.com', 'THERAPIST', 'PENDING'),
           ('Marcus Reid', 'marcus.r@example.com', 'LIFE_COACH', 'PENDING'),
           ('Priya Sharma', 'priya.s@example.com', 'HYPNOTHERAPIST', 'PENDING')`
        );
      }
    } catch (e) { console.log('autoMigrate: specialist_applications skip:', e.message); }

    try {
      const actCount = await db.query('SELECT COUNT(*)::int as c FROM activity_log');
      if (actCount.rows[0].c < 3) {
        await db.query(
          `INSERT INTO activity_log (type, message) VALUES
           ('user_signup', 'New user signed up: testuser1@test.btb.fit'),
           ('session_completed', 'Session completed — Test User One & Dr. Sarah Chen'),
           ('application_submitted', 'New specialist application: Elena Vasquez (Therapist)')`
        );
      }
    } catch (e) { console.log('autoMigrate: activity_log skip:', e.message); }

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
