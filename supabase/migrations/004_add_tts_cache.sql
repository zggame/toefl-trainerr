CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_hash TEXT UNIQUE NOT NULL,
  text_content TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  audio_data TEXT NOT NULL, -- Base64 encoded audio
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tts_cache_hash ON tts_cache(text_hash);
