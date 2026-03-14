import { BrainTip, Condition, Quote, WellnessService } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ---- Fallback data (mirrors NestJS backend) ----

const FALLBACK_AFFIRMATIONS: string[] = [
  'I choose to prioritize my mental wellness alongside my physical health.',
  'I am worthy of healing, growth, and unconditional love.',
  'Every day I move beyond limitations and discover my true potential.',
  'My mind and body work in harmony to support my wellbeing.',
  'I embrace the journey of healing with courage and compassion.',
  'I deserve peace, joy, and a life that feels aligned with my soul.',
  'Healing is not linear, and I honor every step of my journey.',
  'I release what no longer serves me and welcome transformation.',
  'My mental health matters and I invest in it every single day.',
  'I am beyond my struggles. I am resilient, strong, and capable.',
];

const FALLBACK_CONDITIONS: Condition[] = [
  {
    name: 'Anxiety',
    fact: 'Affects 40 million adults annually',
    treatment: '80-90% success rate',
    signs: [
      'Racing thoughts & constant worry',
      'Physical symptoms (heart racing, sweating)',
      'Avoidance of situations or activities',
      'Difficulty concentrating',
    ],
    treatments: [
      'Cognitive Behavioral Therapy (CBT)',
      'Exposure Response Prevention',
      'Mindfulness-based interventions',
      'Medication when appropriate',
    ],
    color: '#7B4FBE',
  },
  {
    name: 'Depression',
    fact: '17+ million adults experience this annually',
    treatment: '70-80% recovery with treatment',
    signs: [
      'Persistent sadness or emptiness',
      'Loss of interest in activities',
      'Changes in sleep/appetite',
      'Thoughts of worthlessness',
    ],
    treatments: [
      'Individual therapy (CBT, IPT, DBT)',
      'Lifestyle interventions',
      'Support group therapy',
    ],
    color: '#C2185B',
  },
  {
    name: 'Trauma & PTSD',
    fact: '70% of adults experience trauma in lifetime',
    treatment: '85% improvement with trauma-informed care',
    signs: [
      'Intrusive memories or flashbacks',
      'Avoidance of trauma reminders',
      'Hypervigilance or easily startled',
      'Negative changes in thoughts/mood',
    ],
    treatments: [
      'EMDR Therapy',
      'Trauma-Focused CBT',
      'Somatic therapy approaches',
      'Group trauma recovery',
    ],
    color: '#1565C0',
  },
  {
    name: 'Stress & Burnout',
    fact: '77% experience physical stress symptoms',
    treatment: '94% recovery rate with proper support',
    signs: [
      'Emotional exhaustion',
      'Cynicism about work/life',
      'Reduced sense of accomplishment',
      'Physical symptoms (headaches, insomnia)',
    ],
    treatments: [
      'Stress reduction techniques',
      'Boundary setting strategies',
      'Work-life balance coaching',
      'Mindfulness & relaxation training',
    ],
    color: '#2E7D32',
  },
];

const FALLBACK_BRAIN_TIPS: BrainTip[] = [
  { title: 'Box Breathing', description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.', category: 'Anxiety Relief', icon: '🫁' },
  { title: '5-4-3-2-1 Grounding', description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', category: 'Grounding', icon: '🌿' },
  { title: 'Cognitive Reframing', description: 'Ask: Is this thought 100% true? What would I tell a friend in this situation?', category: 'Mental Clarity', icon: '🧠' },
  { title: 'Progressive Relaxation', description: 'Tense each muscle group for 5 seconds, then release. Start from your toes.', category: 'Stress Relief', icon: '💪' },
  { title: 'Body Scan Meditation', description: 'Close your eyes and scan from head to toe, releasing tension wherever you find it.', category: 'Mindfulness', icon: '✨' },
  { title: 'Journaling Reset', description: 'Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.', category: 'Emotional Health', icon: '📝' },
];

const FALLBACK_QUOTES: Quote[] = [
  { quote_text: 'You, yourself, as much as anybody in the entire universe, deserve your love and affection.', author: 'Buddha' },
  { quote_text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: 'Noam Shpancer' },
  { quote_text: 'Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.', author: 'Unknown' },
];

// ---- Fetch helpers ----

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export const fetchAffirmations = () =>
  safeFetch<string[]>('/affirmations', FALLBACK_AFFIRMATIONS);

export const fetchConditions = () =>
  safeFetch<Condition[]>('/conditions', FALLBACK_CONDITIONS);

export const fetchBrainTips = () =>
  safeFetch<BrainTip[]>('/brain-tips', FALLBACK_BRAIN_TIPS);

export const fetchQuotes = () =>
  safeFetch<Quote[]>('/quotes', FALLBACK_QUOTES);

// ---- POST helpers (client-side) ----

export async function postContact(data: {
  name: string;
  email: string;
  message: string;
  service?: string;
}) {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function postConsultation(data: {
  name: string;
  email: string;
  phone?: string;
  concern?: string;
  message?: string;
}) {
  const res = await fetch(`${API_URL}/api/consultation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
