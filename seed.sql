-- =====================================================
-- SEED DATA for Narasimha Kavach Dashboard
-- Run this in Supabase SQL Editor
-- =====================================================

-- Fix existing users with null names
UPDATE profiles SET name = 'Admin' WHERE email = 'admin@iskcon.org';
UPDATE profiles SET name = 'Gaura Shyam' WHERE email = 'gaurashyam@iskcon.org';

-- ── Zoom Sessions ──────────────────────────────────────
INSERT INTO zoom_sessions (meeting_id, title, date) VALUES
  ('800000001', 'Monday Evening Kavach', '2026-06-01'),
  ('800000002', 'Wednesday Morning Kavach', '2026-06-03'),
  ('800000003', 'Friday Evening Kavach', '2026-06-05'),
  ('800000004', 'Sunday Morning Special', '2026-06-07'),
  ('800000005', 'Tuesday Evening Kavach', '2026-06-10'),
  ('800000006', 'Thursday Morning Kavach', '2026-06-12'),
  ('800000007', 'Saturday Evening Kavach', '2026-06-14')
ON CONFLICT (meeting_id) DO NOTHING;

-- ── Zoom Attendance (1 round per attendee) ─────────────
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-01';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Suniti Devi'      FROM zoom_sessions WHERE date = '2026-06-01';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Ravi Kumar'       FROM zoom_sessions WHERE date = '2026-06-01';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Meera Bai'        FROM zoom_sessions WHERE date = '2026-06-01';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Govind Das'       FROM zoom_sessions WHERE date = '2026-06-01';

INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-03';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Lakshmi Devi'     FROM zoom_sessions WHERE date = '2026-06-03';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Krishna Das'      FROM zoom_sessions WHERE date = '2026-06-03';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Priya Das'        FROM zoom_sessions WHERE date = '2026-06-03';

INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-05';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Suniti Devi'      FROM zoom_sessions WHERE date = '2026-06-05';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Narasimha Das'    FROM zoom_sessions WHERE date = '2026-06-05';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Radha Devi'       FROM zoom_sessions WHERE date = '2026-06-05';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Govind Das'       FROM zoom_sessions WHERE date = '2026-06-05';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Gauraang Das'     FROM zoom_sessions WHERE date = '2026-06-05';

INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Suniti Devi'      FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Ravi Kumar'       FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Meera Bai'        FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Govind Das'       FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Krishna Das'      FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Lakshmi Devi'     FROM zoom_sessions WHERE date = '2026-06-07';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Narasimha Das'    FROM zoom_sessions WHERE date = '2026-06-07';

INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-10';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Radha Devi'       FROM zoom_sessions WHERE date = '2026-06-10';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Gauraang Das'     FROM zoom_sessions WHERE date = '2026-06-10';

INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Suniti Devi'      FROM zoom_sessions WHERE date = '2026-06-12';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Govind Das'       FROM zoom_sessions WHERE date = '2026-06-12';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Priya Das'        FROM zoom_sessions WHERE date = '2026-06-12';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Meera Bai'        FROM zoom_sessions WHERE date = '2026-06-12';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-12';

INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Arjun Das'        FROM zoom_sessions WHERE date = '2026-06-14';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Suniti Devi'      FROM zoom_sessions WHERE date = '2026-06-14';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Ravi Kumar'       FROM zoom_sessions WHERE date = '2026-06-14';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Govind Das'       FROM zoom_sessions WHERE date = '2026-06-14';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Narasimha Das'    FROM zoom_sessions WHERE date = '2026-06-14';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Radha Devi'       FROM zoom_sessions WHERE date = '2026-06-14';
INSERT INTO zoom_attendance (session_id, participant_name)
SELECT id, 'Krishna Das'      FROM zoom_sessions WHERE date = '2026-06-14';

-- ── Extra Rounds ────────────────────────────────────────
INSERT INTO extra_rounds (devotee_name, rounds, date, note, added_by) VALUES
  ('Arjun Das', 3, '2026-06-02', 'Morning japa', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Suniti Devi', 2, '2026-06-04', 'Evening reading', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Govind Das', 5, '2026-06-06', 'Full 16 rounds day', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Meera Bai', 1, '2026-06-08', 'Lunch break chanting', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Ravi Kumar', 4, '2026-06-09', 'Weekend extra', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Priya Das', 2, '2026-06-11', 'Morning japa', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Narasimha Das', 3, '2026-06-13', 'Evening kirtan prep', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Lakshmi Devi', 2, '2026-06-15', 'Personal sadhana', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Radha Devi', 1, '2026-06-16', 'Commute chanting', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Krishna Das', 3, '2026-06-17', 'Dedicated session', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org')),
  ('Gauraang Das', 2, '2026-06-18', 'Morning round', (SELECT id FROM profiles WHERE email = 'admin@iskcon.org'));
