-- supabase/migrations/001_init_toefl_schema.sql

-- toefl_profiles: per-user ability estimates and behavior metrics
CREATE TABLE IF NOT EXISTS toefl_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  target_score FLOAT DEFAULT 4.0,
  streak_days INT DEFAULT 0,
  last_practice_date DATE,
  avg_wpm FLOAT DEFAULT 0,
  avg_filler_rate FLOAT DEFAULT 0,
  estimated_delivery FLOAT DEFAULT 0,
  estimated_language_use FLOAT DEFAULT 0,
  estimated_topic_dev FLOAT DEFAULT 0,
  weakest_dimension TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- toefl_tasks: audio prompt library
CREATE TABLE IF NOT EXISTS toefl_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  category TEXT NOT NULL CHECK (category IN ('listen_repeat', 'interview')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic_domain TEXT DEFAULT 'general',
  prep_time_seconds INT DEFAULT 15,
  record_time_seconds INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- toefl_attempts: every recording with scores and metadata
CREATE TABLE IF NOT EXISTS toefl_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES toefl_tasks(id),
  mode TEXT NOT NULL CHECK (mode IN ('guided', 'simulation')),
  overall_score FLOAT,
  delivery_score FLOAT,
  language_use_score FLOAT,
  topic_dev_score FLOAT,
  transcript TEXT,
  audio_url TEXT,
  errors TEXT[] DEFAULT '{}',
  suggestion TEXT,
  wpm FLOAT,
  filler_count INT DEFAULT 0,
  retry_mode TEXT DEFAULT 'full' CHECK (retry_mode IN ('full', 'targeted', 'sentence')),
  previous_attempt_id UUID REFERENCES toefl_attempts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching user attempts quickly
CREATE INDEX idx_toefl_attempts_user_id ON toefl_attempts(user_id);
CREATE INDEX idx_toefl_attempts_created_at ON toefl_attempts(user_id, created_at DESC);

-- RLS policies: users can only read/write their own data
ALTER TABLE toefl_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE toefl_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE toefl_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY toefl_profiles_owner ON toefl_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY toefl_tasks_public_read ON toefl_tasks
  FOR SELECT USING (true);

CREATE POLICY toefl_attempts_owner ON toefl_attempts
  FOR ALL USING (auth.uid() = user_id);