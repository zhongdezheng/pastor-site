-- Run this in Cloudflare D1 dashboard or via wrangler:
-- wrangler d1 execute pastor-db --file=src/content/schema.sql

CREATE TABLE IF NOT EXISTS prayer_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  request TEXT NOT NULL,
  lang TEXT DEFAULT 'en',
  anonymous INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prayer_created ON prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_email ON prayer_requests(email);
