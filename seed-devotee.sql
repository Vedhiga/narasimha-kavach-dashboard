-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS devotee_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  devotee_name TEXT NOT NULL,
  chanting INTEGER DEFAULT 0,
  narasimha_kavach INTEGER DEFAULT 0,
  tulasi_parikrama INTEGER DEFAULT 0,
  tulasi_offered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devotee_activities_date ON devotee_activities(date);
CREATE INDEX IF NOT EXISTS idx_devotee_activities_name ON devotee_activities(devotee_name);

INSERT INTO devotee_activities (date, devotee_name, chanting, narasimha_kavach, tulasi_parikrama, tulasi_offered) VALUES
  ('2026-06-15', 'Ram Das', 16, 2, 4, 7),
  ('2026-06-15', 'Shyama Priya', 8, 1, 2, 3),
  ('2026-06-15', 'Govinda Das', 32, 3, 6, 10),
  ('2026-06-15', 'Madhava Das', 24, 2, 5, 8),
  ('2026-06-16', 'Ram Das', 12, 1, 3, 5),
  ('2026-06-16', 'Shyama Priya', 16, 2, 4, 6),
  ('2026-06-16', 'Gauranga Das', 40, 4, 8, 12),
  ('2026-06-16', 'Lalita Devi', 20, 2, 5, 9),
  ('2026-06-16', 'Madhava Das', 32, 3, 6, 11),
  ('2026-06-17', 'Ram Das', 16, 2, 4, 7),
  ('2026-06-17', 'Gauranga Das', 32, 3, 6, 10),
  ('2026-06-17', 'Govinda Das', 24, 2, 5, 8),
  ('2026-06-17', 'Lalita Devi', 12, 1, 3, 5),
  ('2026-06-17', 'Madhava Das', 16, 2, 4, 6),
  ('2026-06-18', 'Shyama Priya', 8, 1, 2, 3),
  ('2026-06-18', 'Gauranga Das', 48, 5, 10, 15),
  ('2026-06-18', 'Ram Das', 24, 3, 5, 9)
ON CONFLICT DO NOTHING;
