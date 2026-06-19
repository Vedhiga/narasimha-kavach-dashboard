/**
 * Seed script — populates Supabase with test data.
 * Usage:  node seed.js
 * Requires: SUPABASE_URL + SUPABASE_SERVICE_KEY in .env
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function seed() {
  console.log("Seeding database...\n");

  // Fix profile names
  const { error: nameErr } = await supabase
    .from("profiles")
    .update({ name: "Admin" })
    .eq("email", "admin@iskcon.org");
  if (nameErr) console.log("  Profile fix (admin):", nameErr.message);
  else console.log("  Updated profile: admin@iskcon.org -> Admin");

  const { error: nameErr2 } = await supabase
    .from("profiles")
    .update({ name: "Gaura Shyam" })
    .eq("email", "gaurashyam@iskcon.org");
  if (nameErr2) console.log("  Profile fix (gaurashyam):", nameErr2.message);
  else console.log("  Updated profile: gaurashyam@iskcon.org -> Gaura Shyam");

  // ── Zoom Sessions ────────────────────────────────────
  const sessions = [
    { meeting_id: "800000001", title: "Monday Evening Kavach", date: "2026-06-01" },
    { meeting_id: "800000002", title: "Wednesday Morning Kavach", date: "2026-06-03" },
    { meeting_id: "800000003", title: "Friday Evening Kavach", date: "2026-06-05" },
    { meeting_id: "800000004", title: "Sunday Morning Special", date: "2026-06-07" },
    { meeting_id: "800000005", title: "Tuesday Evening Kavach", date: "2026-06-10" },
    { meeting_id: "800000006", title: "Thursday Morning Kavach", date: "2026-06-12" },
    { meeting_id: "800000007", title: "Saturday Evening Kavach", date: "2026-06-14" },
  ];

  const { data: sessData, error: sessErr } = await supabase
    .from("zoom_sessions")
    .upsert(sessions, { onConflict: "meeting_id" })
    .select();
  if (sessErr) { console.log("  Sessions error:", sessErr.message); } 
  else { console.log(`  Upserted ${sessData.length} zoom sessions`); }

  // Fetch back session IDs
  const { data: allSessions } = await supabase.from("zoom_sessions").select("id, date").order("date");

  const sessionMap = {};
  allSessions.forEach(s => { sessionMap[s.date.slice(0, 10)] = s.id; });

  // ── Attendance ───────────────────────────────────────
  const attendees = {
    "2026-06-01": ["Arjun Das", "Suniti Devi", "Ravi Kumar", "Meera Bai", "Govind Das"],
    "2026-06-03": ["Arjun Das", "Lakshmi Devi", "Krishna Das", "Priya Das"],
    "2026-06-05": ["Arjun Das", "Suniti Devi", "Narasimha Das", "Radha Devi", "Govind Das", "Gauraang Das"],
    "2026-06-07": ["Arjun Das", "Suniti Devi", "Ravi Kumar", "Meera Bai", "Govind Das", "Krishna Das", "Lakshmi Devi", "Narasimha Das"],
    "2026-06-10": ["Arjun Das", "Radha Devi", "Gauraang Das"],
    "2026-06-12": ["Suniti Devi", "Govind Das", "Priya Das", "Meera Bai", "Arjun Das"],
    "2026-06-14": ["Arjun Das", "Suniti Devi", "Ravi Kumar", "Govind Das", "Narasimha Das", "Radha Devi", "Krishna Das"],
  };

  // Clear old attendance first
  await supabase.from("zoom_attendance").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const attRows = [];
  for (const [date, names] of Object.entries(attendees)) {
    const sid = sessionMap[date];
    if (!sid) continue;
    names.forEach(name => attRows.push({ session_id: sid, participant_name: name }));
  }
  const { error: attErr } = await supabase.from("zoom_attendance").insert(attRows);
  if (attErr) console.log("  Attendance error:", attErr.message);
  else console.log(`  Inserted ${attRows.length} attendance records`);

  // ── Extra Rounds ─────────────────────────────────────
  // Get admin user id
  const { data: adminProfile } = await supabase.from("profiles").select("id").eq("email", "admin@iskcon.org").single();
  const adminId = adminProfile?.id;

  await supabase.from("extra_rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const extraRounds = [
    { devotee_name: "Arjun Das", rounds: 3, note: "Morning japa", date: "2026-06-02" },
    { devotee_name: "Suniti Devi", rounds: 2, note: "Evening reading", date: "2026-06-04" },
    { devotee_name: "Govind Das", rounds: 5, note: "Full 16 rounds day", date: "2026-06-06" },
    { devotee_name: "Meera Bai", rounds: 1, note: "Lunch break chanting", date: "2026-06-08" },
    { devotee_name: "Ravi Kumar", rounds: 4, note: "Weekend extra", date: "2026-06-09" },
    { devotee_name: "Priya Das", rounds: 2, note: "Morning japa", date: "2026-06-11" },
    { devotee_name: "Narasimha Das", rounds: 3, note: "Evening kirtan prep", date: "2026-06-13" },
    { devotee_name: "Lakshmi Devi", rounds: 2, note: "Personal sadhana", date: "2026-06-15" },
    { devotee_name: "Radha Devi", rounds: 1, note: "Commute chanting", date: "2026-06-16" },
    { devotee_name: "Krishna Das", rounds: 3, note: "Dedicated session", date: "2026-06-17" },
    { devotee_name: "Gauraang Das", rounds: 2, note: "Morning round", date: "2026-06-18" },
  ].map(r => ({ ...r, added_by: adminId }));

  const { error: erErr } = await supabase.from("extra_rounds").insert(extraRounds);
  if (erErr) console.log("  Extra rounds error:", erErr.message);
  else console.log(`  Inserted ${extraRounds.length} extra round records`);

  // ── Summary ──────────────────────────────────────────
  const { count: sessCount } = await supabase.from("zoom_sessions").select("*", { count: "exact", head: true });
  const { count: attCount } = await supabase.from("zoom_attendance").select("*", { count: "exact", head: true });
  const { count: erCount } = await supabase.from("extra_rounds").select("*", { count: "exact", head: true });

  console.log("\nSeed complete:");
  console.log(`  Sessions:    ${sessCount}`);
  console.log(`  Attendance:  ${attCount} rows`);
  console.log(`  Extra rounds: ${erCount} rows`);
}

seed().catch(e => { console.error("Seed failed:", e.message); process.exit(1); });
