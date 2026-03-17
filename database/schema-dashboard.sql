-- Beyond The Body — Dashboard tables (run after schema.sql)
-- Users and roles
CREATE TABLE IF NOT EXISTS dashboard_users (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(255) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password_hash      VARCHAR(255),
  role               VARCHAR(50) NOT NULL DEFAULT 'USER',
  avatar_url         VARCHAR(500),
  healing_score      INT DEFAULT 0,
  sessions_allotted  INT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_specialists (
  user_id        INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  specialist_id   INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, specialist_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  specialist_id    INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  type             VARCHAR(100) NOT NULL,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  status           VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
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
  user_id     INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  milestone_id INT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  unlocked_at DATE NOT NULL DEFAULT CURRENT_DATE,
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
  specialty  VARCHAR(50) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_notes (
  id           SERIAL PRIMARY KEY,
  session_id   INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  specialist_id INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  is_private   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_requests (
  id            SERIAL PRIMARY KEY,
  specialist_id INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  user_id       INT NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
  proposed_at   TIMESTAMPTZ NOT NULL,
  session_type  VARCHAR(100) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
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

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_specialist ON sessions(specialist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_mood_log_user_date ON mood_log(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
