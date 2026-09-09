-- StatSkill AI Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT 'password123',
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  role_id TEXT NOT NULL,
  experience INTEGER DEFAULT 0,
  qualification TEXT,
  preferred_language TEXT DEFAULT 'en',
  avatar TEXT,
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Explorer',
  level_number INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_activity_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS competencies (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL, -- STATISTICAL, TECHNICAL, DIGITAL_GOVERNANCE, BEHAVIOURAL_MANAGERIAL
  required_level INTEGER DEFAULT 70,
  parent_id TEXT,
  status TEXT DEFAULT 'ACTIVE',
  FOREIGN KEY (parent_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS competency_edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'PREREQUISITE',
  weight REAL DEFAULT 1.0,
  FOREIGN KEY (source_id) REFERENCES competencies(id),
  FOREIGN KEY (target_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS role_competencies (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  required_level INTEGER NOT NULL,
  role_weight REAL DEFAULT 1.0,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL, -- iGOT, NSSTA
  description TEXT,
  duration_hours REAL DEFAULT 4.0,
  url TEXT,
  level TEXT DEFAULT 'Intermediate',
  thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS course_competencies (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  target_mastery INTEGER DEFAULT 75,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',
  file_path TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  heading TEXT,
  content TEXT NOT NULL,
  competency_id TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'MCQ', -- MCQ, SCENARIO
  options JSON NOT NULL, -- ["A", "B", "C", "D"]
  correct_answer TEXT NOT NULL, -- Option text or identifier
  explanation TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  difficulty TEXT DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
  bloom_level TEXT DEFAULT 'APPLICATION', -- REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE
  source_document_id TEXT,
  source_page INTEGER,
  source_chunk_id TEXT,
  critic_score REAL DEFAULT 0.95,
  status TEXT DEFAULT 'APPROVED', -- GENERATED, APPROVED, REJECTED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competency_id) REFERENCES competencies(id),
  FOREIGN KEY (source_document_id) REFERENCES documents(id),
  FOREIGN KEY (source_chunk_id) REFERENCES document_chunks(id)
);

CREATE TABLE IF NOT EXISTS diagnostics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED
  total_questions INTEGER DEFAULT 10,
  score REAL,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id TEXT PRIMARY KEY,
  diagnostic_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (diagnostic_id) REFERENCES diagnostics(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS diagnostic_answers (
  id TEXT PRIMARY KEY,
  diagnostic_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  user_answer TEXT,
  is_correct INTEGER,
  time_spent_seconds INTEGER,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diagnostic_id) REFERENCES diagnostics(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  competency_id TEXT,
  document_id TEXT,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'QUIZ', -- QUIZ, REASSESSMENT, PRACTICAL
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED
  score REAL,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  user_answer TEXT,
  is_correct INTEGER,
  time_spent_seconds INTEGER,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  assessment_id TEXT,
  diagnostic_id TEXT,
  question_id TEXT,
  evidence_type TEXT NOT NULL, -- DIAGNOSTIC, QUIZ, PRACTICAL, COURSE_COMPLETION, REASSESSMENT
  score REAL NOT NULL, -- 0 to 100
  weight REAL DEFAULT 1.0,
  difficulty TEXT DEFAULT 'MEDIUM',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS mastery_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  mastery REAL NOT NULL DEFAULT 0, -- 0 - 100
  confidence TEXT DEFAULT 'LOW', -- LOW (<3 evidence), MEDIUM (3-7), HIGH (>7)
  evidence_count INTEGER DEFAULT 0,
  is_root_gap INTEGER DEFAULT 0,
  downstream_impact_count INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, competency_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  competency_id TEXT NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  provider TEXT NOT NULL, -- iGOT, NSSTA
  priority TEXT NOT NULL, -- HIGH, MEDIUM, LOW
  reason JSON NOT NULL, -- List of reason strings
  expected_outcome TEXT,
  prerequisite_status TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (competency_id) REFERENCES competencies(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- DIAGNOSTIC_COMPLETED, LESSON_COMPLETED, QUIZ_COMPLETED, QUIZ_PASSED, COMPETENCY_MASTERED, MISSION_COMPLETED, PRACTICAL_COMPLETED, STREAK_MILESTONE
  xp INTEGER NOT NULL,
  reference_id TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id)
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  competency_id TEXT,
  xp_reward INTEGER DEFAULT 150,
  badge_reward_id TEXT,
  target_type TEXT NOT NULL, -- COMPLETE_DIAGNOSTIC, PASS_QUIZ, MASTER_COMPETENCY, COMPLETE_COURSE
  target_value TEXT,
  FOREIGN KEY (competency_id) REFERENCES competencies(id),
  FOREIGN KEY (badge_reward_id) REFERENCES badges(id)
);

CREATE TABLE IF NOT EXISTS mission_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0, -- 0 - 100
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED
  completed_at DATETIME,
  UNIQUE(user_id, mission_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSON,
  new_value JSON,
  reason TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
