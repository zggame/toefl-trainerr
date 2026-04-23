-- supabase/migrations/003_add_usage_tracking.sql

-- Add columns to toefl_profiles for daily limits and tier management
ALTER TABLE toefl_profiles 
ADD COLUMN IF NOT EXISTS daily_attempt_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attempt_reset TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_tier TEXT DEFAULT 'free' CHECK (user_tier IN ('free', 'premium', 'admin'));

-- Add token tracking to toefl_attempts for cost monitoring
ALTER TABLE toefl_attempts
ADD COLUMN IF NOT EXISTS prompt_tokens INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_tokens INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INT DEFAULT 0;

-- Index for admin monitoring of total tokens per user
CREATE INDEX IF NOT EXISTS idx_toefl_attempts_tokens ON toefl_attempts(user_id, total_tokens);
