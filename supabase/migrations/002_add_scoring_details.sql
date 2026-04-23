-- Migration: Add flexible scoring_details JSONB column
ALTER TABLE toefl_attempts ADD COLUMN IF NOT EXISTS scoring_details JSONB;
