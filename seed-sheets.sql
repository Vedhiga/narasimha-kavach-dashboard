-- Run this in Supabase SQL Editor

-- Create the daily_activities table
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  devotees INTEGER DEFAULT 0,
  chanting INTEGER DEFAULT 0,
  narasimha_kavach INTEGER DEFAULT 0,
  tulasi_parikrama INTEGER DEFAULT 0,
  tulasi_offered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO daily_activities (date, devotees, chanting, narasimha_kavach, tulasi_parikrama, tulasi_offered)
VALUES
  ('2026-06-01', 28, 45, 3, 12, 18),
  ('2026-06-02', 32, 52, 4, 15, 22),
  ('2026-06-03', 25, 38, 2, 10, 15),
  ('2026-06-04', 35, 60, 5, 18, 25),
  ('2026-06-05', 30, 48, 3, 14, 20),
  ('2026-06-06', 40, 72, 6, 20, 30),
  ('2026-06-07', 55, 85, 8, 25, 35),
  ('2026-06-08', 22, 35, 2, 8, 12),
  ('2026-06-09', 38, 58, 4, 16, 24),
  ('2026-06-10', 31, 50, 3, 12, 19),
  ('2026-06-11', 28, 42, 3, 10, 16),
  ('2026-06-12', 34, 55, 4, 14, 21),
  ('2026-06-13', 42, 68, 5, 18, 28),
  ('2026-06-14', 47, 75, 6, 22, 32),
  ('2026-06-15', 26, 40, 3, 10, 14),
  ('2026-06-16', 33, 54, 4, 15, 22),
  ('2026-06-17', 38, 62, 5, 17, 26),
  ('2026-06-18', 30, 48, 3, 12, 20)
ON CONFLICT DO NOTHING;
