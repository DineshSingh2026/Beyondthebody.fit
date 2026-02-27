-- Beyond The Body — Seed Data (run after schema.sql)
-- psql -U postgres -d beyond_the_body -f database/seed.sql

-- Clear content tables so seed is re-runnable (keeps consultations & join_applications)
TRUNCATE conditions, affirmations, brain_tips, quotes, services RESTART IDENTITY CASCADE;

-- ===================== CONDITIONS =====================
INSERT INTO conditions (name, fact, treatment, color) VALUES
  ('Anxiety', 'Affects 40 million adults annually', '80-90% success rate', '#7B4FBE'),
  ('Depression', '17+ million adults experience this annually', '70-80% recovery with treatment', '#C2185B'),
  ('Trauma & PTSD', '70% of adults experience trauma in lifetime', '85% improvement with trauma-informed care', '#1565C0'),
  ('Stress & Burnout', '77% experience physical stress symptoms', '94% recovery rate with proper support', '#2E7D32');

-- Condition signs (condition_id 1=Anxiety, 2=Depression, 3=Trauma, 4=Stress)
INSERT INTO condition_signs (condition_id, text, sort_order) VALUES
  (1, 'Racing thoughts & constant worry', 1),
  (1, 'Physical symptoms (heart racing, sweating)', 2),
  (1, 'Avoidance of situations or activities', 3),
  (1, 'Difficulty concentrating', 4),
  (2, 'Persistent sadness or emptiness', 1),
  (2, 'Loss of interest in activities', 2),
  (2, 'Changes in sleep/appetite', 3),
  (2, 'Thoughts of worthlessness', 4),
  (3, 'Intrusive memories or flashbacks', 1),
  (3, 'Avoidance of trauma reminders', 2),
  (3, 'Hypervigilance or easily startled', 3),
  (3, 'Negative changes in thoughts/mood', 4),
  (4, 'Emotional exhaustion', 1),
  (4, 'Cynicism about work/life', 2),
  (4, 'Reduced sense of accomplishment', 3),
  (4, 'Physical symptoms (headaches, insomnia)', 4);

-- Condition treatments
INSERT INTO condition_treatments (condition_id, text, sort_order) VALUES
  (1, 'Cognitive Behavioral Therapy (CBT)', 1),
  (1, 'Exposure Response Prevention', 2),
  (1, 'Mindfulness-based interventions', 3),
  (1, 'Medication when appropriate', 4),
  (2, 'Individual therapy (CBT, IPT, DBT)', 1),
  (2, 'Lifestyle interventions', 2),
  (2, 'Support group therapy', 3),
  (3, 'EMDR Therapy', 1),
  (3, 'Trauma-Focused CBT', 2),
  (3, 'Somatic therapy approaches', 3),
  (3, 'Group trauma recovery', 4),
  (4, 'Stress reduction techniques', 1),
  (4, 'Boundary setting strategies', 2),
  (4, 'Work-life balance coaching', 3),
  (4, 'Mindfulness & relaxation training', 4);

-- ===================== AFFIRMATIONS =====================
INSERT INTO affirmations (text, sort_order) VALUES
  ('I choose to prioritize my mental wellness alongside my physical health.', 1),
  ('I am worthy of healing, growth, and unconditional love.', 2),
  ('Every day I move beyond limitations and discover my true potential.', 3),
  ('My mind and body work in harmony to support my wellbeing.', 4),
  ('I embrace the journey of healing with courage and compassion.', 5),
  ('I deserve peace, joy, and a life that feels aligned with my soul.', 6),
  ('Healing is not linear, and I honor every step of my journey.', 7),
  ('I release what no longer serves me and welcome transformation.', 8),
  ('My mental health matters and I invest in it every single day.', 9),
  ('I am beyond my struggles. I am resilient, strong, and capable.', 10);

-- ===================== BRAIN TIPS =====================
INSERT INTO brain_tips (title, description, category, icon, sort_order) VALUES
  ('Box Breathing', 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.', 'Anxiety Relief', '🫁', 1),
  ('5-4-3-2-1 Grounding', 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', 'Grounding', '🌿', 2),
  ('Cognitive Reframing', 'Ask: Is this thought 100% true? What would I tell a friend in this situation?', 'Mental Clarity', '🧠', 3),
  ('Progressive Relaxation', 'Tense each muscle group for 5 seconds, then release. Start from your toes.', 'Stress Relief', '💪', 4),
  ('Body Scan Meditation', 'Close your eyes and scan from head to toe, releasing tension wherever you find it.', 'Mindfulness', '✨', 5),
  ('Journaling Reset', 'Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.', 'Emotional Health', '📝', 6);

-- ===================== QUOTES =====================
INSERT INTO quotes (quote_text, author, sort_order) VALUES
  ('You, yourself, as much as anybody in the entire universe, deserve your love and affection.', 'Buddha', 1),
  ('Mental health is not a destination, but a process. It''s about how you drive, not where you''re going.', 'Noam Shpancer', 2),
  ('Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.', 'Unknown', 3);

-- ===================== SERVICES =====================
INSERT INTO services (title, icon, badge, is_featured, sort_order) VALUES
  ('Licensed Therapists', '🪪', NULL, FALSE, 1),
  ('Specialized Experts', '⚡', 'Most Popular', TRUE, 2),
  ('Trauma Specialists', '💜', NULL, FALSE, 3),
  ('Group Facilitators', '🤝', NULL, FALSE, 4);

INSERT INTO service_items (service_id, text, sort_order) VALUES
  (1, 'Anxiety & Depression', 1),
  (1, 'Relationship Counseling', 2),
  (1, 'Life Transitions', 3),
  (2, 'Eating Disorders', 1),
  (2, 'Workplace Stress', 2),
  (2, 'Family Therapy', 3),
  (3, 'PTSD & Complex Trauma', 1),
  (3, 'Childhood Trauma Recovery', 2),
  (3, 'Crisis Intervention', 3),
  (4, 'Support Circles', 1),
  (4, 'Grief & Loss Groups', 2),
  (4, 'Addiction Recovery', 3);
