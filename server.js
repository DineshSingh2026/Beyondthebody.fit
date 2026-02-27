require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Beyond The Body server running on http://localhost:${port}`);
    if (db.connected) console.log('PostgreSQL: connected');
    else console.log('PostgreSQL: not configured (using in-memory data). Set DATABASE_URL to use DB.');
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
