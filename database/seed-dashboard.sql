-- Beyond The Body — Dashboard seed (run after schema-dashboard.sql)
TRUNCATE dashboard_users, user_specialists, sessions, mood_log, user_milestones, community_posts,
  specialist_applications, session_notes, booking_requests, reviews, activity_log RESTART IDENTITY CASCADE;
TRUNCATE milestones RESTART IDENTITY CASCADE;

-- Users: 1 admin, 4 specialists, 3 clients
INSERT INTO dashboard_users (id, name, email, role, healing_score) VALUES
  (1, 'Admin', 'admin@beyondthebody.fit', 'ADMIN', 0),
  (2, 'Dr. Sarah Chen', 'sarah@btb.fit', 'THERAPIST', 0),
  (3, 'James Miller', 'james@btb.fit', 'LIFE_COACH', 0),
  (4, 'Maya Foster', 'maya@btb.fit', 'HYPNOTHERAPIST', 0),
  (5, 'Leo Torres', 'leo@btb.fit', 'MUSIC_TUTOR', 0),
  (6, 'Alex Rivera', 'alex@example.com', 'USER', 72),
  (7, 'Jordan Kim', 'jordan@example.com', 'USER', 65),
  (8, 'Sam Taylor', 'sam@example.com', 'USER', 58);
SELECT setval('dashboard_users_id_seq', 8);

-- User 6 (Alex) has specialists 2, 3, 4
INSERT INTO user_specialists (user_id, specialist_id) VALUES
  (6, 2), (6, 3), (6, 4);

-- Milestones (global)
INSERT INTO milestones (title, description, icon, sort_order) VALUES
  ('First session completed', 'You began your healing journey', '🌱', 1),
  ('10 sessions milestone', 'Consistency is your superpower', '✨', 2),
  ('7-day streak', 'Daily check-ins for 7 days', '🔥', 3);

INSERT INTO user_milestones (user_id, milestone_id, unlocked_at) VALUES
  (6, 1, '2024-01-15'),
  (6, 2, '2024-03-01'),
  (6, 3, CURRENT_DATE);

-- Sessions: past and upcoming for Alex (user 6) with specialists 2, 3
INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status, rating, completed_at) VALUES
  (6, 2, '1:1 Therapy', NOW() + INTERVAL '2 hours', 50, 'UPCOMING', NULL, NULL),
  (6, 3, 'Goal Setting', (DATE_TRUNC('week', NOW()) + INTERVAL '5 days') + TIME '10:00', 45, 'UPCOMING', NULL, NULL),
  (6, 2, '1:1 Therapy', NOW() - INTERVAL '2 days', 50, 'COMPLETED', 5, NOW() - INTERVAL '2 days'),
  (7, 2, '1:1', NOW() - INTERVAL '1 hour', 50, 'COMPLETED', 5, NOW() - INTERVAL '1 hour'),
  (7, 4, 'Session', NOW() + INTERVAL '30 minutes', 60, 'IN_PROGRESS', NULL, NULL),
  (8, 3, 'Coaching', NOW() + INTERVAL '4 hours', 45, 'UPCOMING', NULL, NULL);
-- More completed for stats
INSERT INTO sessions (user_id, specialist_id, type, scheduled_at, duration_minutes, status, rating, completed_at)
SELECT 6, 2, 'Therapy', NOW() - (n || ' days')::INTERVAL, 50, 'COMPLETED', 4 + (n % 2), NOW() - (n || ' days')::INTERVAL
FROM generate_series(1, 22) n;

-- Mood log for user 6 (last 14 days)
INSERT INTO mood_log (user_id, date, value, note)
SELECT 6, CURRENT_DATE - (14 - d), 5 + (random() * 4)::int, CASE WHEN d = 14 THEN 'Feeling grounded after session' END
FROM generate_series(1, 14) d;

-- Community posts
INSERT INTO community_posts (user_id, content, likes, comments, created_at) VALUES
  (7, 'Today I finally spoke about my anxiety in group. So grateful for this safe space.', 24, 5, NOW() - INTERVAL '2 hours'),
  (8, 'Three months in and my sleep has never been better. Mind-body connection is real.', 41, 8, NOW() - INTERVAL '5 hours');

-- Specialist applications (admin)
INSERT INTO specialist_applications (name, email, specialty, status, applied_at) VALUES
  ('Elena Vasquez', 'elena@example.com', 'THERAPIST', 'PENDING', NOW() - INTERVAL '2 days'),
  ('David Park', 'david@example.com', 'LIFE_COACH', 'REVIEWING', NOW() - INTERVAL '3 days'),
  ('Priya Sharma', 'priya@example.com', 'HYPNOTHERAPIST', 'PENDING', NOW() - INTERVAL '4 days');

-- Session notes (therapist 2; use completed session ids: 3 = user 6 completed, 4 = user 7 completed)
INSERT INTO session_notes (session_id, specialist_id, user_id, content, is_private) VALUES
  (3, 2, 6, 'Client reported reduced anxiety after practicing grounding techniques. Will continue...', TRUE),
  (4, 2, 7, 'Deep trance achieved. Client explored root cause of sleep issue. Follow-up in 1 week.', TRUE);

-- Booking requests for specialist 2
INSERT INTO booking_requests (specialist_id, user_id, proposed_at, session_type, status) VALUES
  (2, 6, (DATE_TRUNC('week', NOW()) + INTERVAL '4 days') + TIME '15:00', '1:1 Therapy', 'PENDING'),
  (2, 7, (DATE_TRUNC('week', NOW()) + INTERVAL '8 days') + TIME '11:00', 'Initial Consult', 'PENDING');

-- Reviews for specialist 2
INSERT INTO reviews (session_id, user_id, specialist_id, rating, excerpt, created_at) VALUES
  (3, 6, 2, 5, 'Sarah creates such a safe space. I''ve made more progress in 3 months than years on my own.', NOW() - INTERVAL '3 days'),
  (4, 7, 2, 5, 'Life-changing sessions. Grateful for this platform.', NOW() - INTERVAL '5 days');

-- Activity log
INSERT INTO activity_log (type, message, created_at) VALUES
  ('user_signup', 'New user signed up: alex@example.com', NOW() - INTERVAL '2 minutes'),
  ('session_completed', 'Session completed — Alex R. & Dr. Sarah Chen', NOW() - INTERVAL '12 minutes'),
  ('application_submitted', 'New specialist application: Elena Vasquez (Therapist)', NOW() - INTERVAL '1 hour'),
  ('payment_received', 'Payment received: £120.00', NOW() - INTERVAL '2 hours');
