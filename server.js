require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DB_READY = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes("your-project");

let supabase = null;
if (DB_READY) {
  const { createClient } = require("@supabase/supabase-js");
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  console.log("Connected to Supabase");
} else {
  console.log("WARNING: Supabase not configured. Running in DEMO mode with mock data.");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Mock data for demo mode ───────────────────────────
let nextId = 100;
const mock = {
  devoteeActivities: [
    { id: 1, date: "2026-06-15", devotee_name: "Ram Das", chanting: 16, narasimha_kavach: 2, tulasi_parikrama: 4, tulasi_offered: 7, created_at: "2026-06-15T10:00:00Z" },
    { id: 2, date: "2026-06-15", devotee_name: "Shyama Priya", chanting: 8, narasimha_kavach: 1, tulasi_parikrama: 2, tulasi_offered: 3, created_at: "2026-06-15T10:00:00Z" },
    { id: 3, date: "2026-06-15", devotee_name: "Govinda Das", chanting: 32, narasimha_kavach: 3, tulasi_parikrama: 6, tulasi_offered: 10, created_at: "2026-06-15T10:00:00Z" },
    { id: 4, date: "2026-06-15", devotee_name: "Madhava Das", chanting: 24, narasimha_kavach: 2, tulasi_parikrama: 5, tulasi_offered: 8, created_at: "2026-06-15T10:00:00Z" },
    { id: 5, date: "2026-06-16", devotee_name: "Ram Das", chanting: 12, narasimha_kavach: 1, tulasi_parikrama: 3, tulasi_offered: 5, created_at: "2026-06-16T10:00:00Z" },
    { id: 6, date: "2026-06-16", devotee_name: "Shyama Priya", chanting: 16, narasimha_kavach: 2, tulasi_parikrama: 4, tulasi_offered: 6, created_at: "2026-06-16T10:00:00Z" },
    { id: 7, date: "2026-06-16", devotee_name: "Gauranga Das", chanting: 40, narasimha_kavach: 4, tulasi_parikrama: 8, tulasi_offered: 12, created_at: "2026-06-16T10:00:00Z" },
    { id: 8, date: "2026-06-16", devotee_name: "Lalita Devi", chanting: 20, narasimha_kavach: 2, tulasi_parikrama: 5, tulasi_offered: 9, created_at: "2026-06-16T10:00:00Z" },
    { id: 9, date: "2026-06-16", devotee_name: "Madhava Das", chanting: 32, narasimha_kavach: 3, tulasi_parikrama: 6, tulasi_offered: 11, created_at: "2026-06-16T10:00:00Z" },
    { id: 10, date: "2026-06-17", devotee_name: "Ram Das", chanting: 16, narasimha_kavach: 2, tulasi_parikrama: 4, tulasi_offered: 7, created_at: "2026-06-17T10:00:00Z" },
    { id: 11, date: "2026-06-17", devotee_name: "Gauranga Das", chanting: 32, narasimha_kavach: 3, tulasi_parikrama: 6, tulasi_offered: 10, created_at: "2026-06-17T10:00:00Z" },
    { id: 12, date: "2026-06-17", devotee_name: "Govinda Das", chanting: 24, narasimha_kavach: 2, tulasi_parikrama: 5, tulasi_offered: 8, created_at: "2026-06-17T10:00:00Z" },
    { id: 13, date: "2026-06-17", devotee_name: "Lalita Devi", chanting: 12, narasimha_kavach: 1, tulasi_parikrama: 3, tulasi_offered: 5, created_at: "2026-06-17T10:00:00Z" },
    { id: 14, date: "2026-06-17", devotee_name: "Madhava Das", chanting: 16, narasimha_kavach: 2, tulasi_parikrama: 4, tulasi_offered: 6, created_at: "2026-06-17T10:00:00Z" },
    { id: 15, date: "2026-06-18", devotee_name: "Shyama Priya", chanting: 8, narasimha_kavach: 1, tulasi_parikrama: 2, tulasi_offered: 3, created_at: "2026-06-18T10:00:00Z" },
    { id: 16, date: "2026-06-18", devotee_name: "Gauranga Das", chanting: 48, narasimha_kavach: 5, tulasi_parikrama: 10, tulasi_offered: 15, created_at: "2026-06-18T10:00:00Z" },
    { id: 17, date: "2026-06-18", devotee_name: "Ram Das", chanting: 24, narasimha_kavach: 3, tulasi_parikrama: 5, tulasi_offered: 9, created_at: "2026-06-18T10:00:00Z" },
  ],
};

// ── Helpers ────────────────────────────────────────────
function toISO(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  return "";
}

// ── Summary ────────────────────────────────────────────
app.get("/api/summary", async (_req, res) => {
  if (DB_READY) {
    const { data } = await supabase.from("devotee_activities").select("*");
    const rows = data || [];
    const totals = rows.reduce((a, r) => ({
      total_devotees: 0,
      total_chanting: a.total_chanting + (r.chanting || 0),
      total_narasimha_kavach: a.total_narasimha_kavach + (r.narasimha_kavach || 0),
      total_tulasi_parikrama: a.total_tulasi_parikrama + (r.tulasi_parikrama || 0),
      total_tulasi_offered: a.total_tulasi_offered + (r.tulasi_offered || 0),
    }), { total_devotees: 0, total_chanting: 0, total_narasimha_kavach: 0, total_tulasi_parikrama: 0, total_tulasi_offered: 0 });
    const uniqueDevotees = new Set(rows.map(r => r.devotee_name));
    const uniqueDates = new Set(rows.map(r => toISO(r.date)));
    return res.json({ ...totals, total_devotees: uniqueDevotees.size, total_dates: uniqueDates.size, total_entries: rows.length });
  }

  const rows = mock.devoteeActivities;
  const totals = rows.reduce((a, r) => ({
    total_chanting: a.total_chanting + (r.chanting || 0),
    total_narasimha_kavach: a.total_narasimha_kavach + (r.narasimha_kavach || 0),
    total_tulasi_parikrama: a.total_tulasi_parikrama + (r.tulasi_parikrama || 0),
    total_tulasi_offered: a.total_tulasi_offered + (r.tulasi_offered || 0),
  }), { total_chanting: 0, total_narasimha_kavach: 0, total_tulasi_parikrama: 0, total_tulasi_offered: 0 });
  const uniqueDevotees = new Set(rows.map(r => r.devotee_name));
  const uniqueDates = new Set(rows.map(r => toISO(r.date)));
  res.json({ ...totals, total_devotees: uniqueDevotees.size, total_dates: uniqueDates.size, total_entries: rows.length });
});

// ── By Date ────────────────────────────────────────────
app.get("/api/by-date", async (_req, res) => {
  if (DB_READY) {
    const { data } = await supabase.from("devotee_activities").select("*").order("date", { ascending: false }).order("devotee_name");
    const rows = data || [];
    const map = {};
    for (const r of rows) {
      const key = toISO(r.date);
      if (!map[key]) map[key] = { date: key, devotees: [], totals: { chanting: 0, narasimha_kavach: 0, tulasi_parikrama: 0, tulasi_offered: 0 } };
      map[key].devotees.push(r);
      map[key].totals.chanting += r.chanting || 0;
      map[key].totals.narasimha_kavach += r.narasimha_kavach || 0;
      map[key].totals.tulasi_parikrama += r.tulasi_parikrama || 0;
      map[key].totals.tulasi_offered += r.tulasi_offered || 0;
    }
    return res.json(Object.values(map));
  }

  const rows = mock.devoteeActivities.slice().sort((a, b) => b.date.localeCompare(a.date) || a.devotee_name.localeCompare(b.devotee_name));
  const map = {};
  for (const r of rows) {
    const key = toISO(r.date);
    if (!map[key]) map[key] = { date: key, devotees: [], totals: { chanting: 0, narasimha_kavach: 0, tulasi_parikrama: 0, tulasi_offered: 0 } };
    map[key].devotees.push(r);
    map[key].totals.chanting += r.chanting || 0;
    map[key].totals.narasimha_kavach += r.narasimha_kavach || 0;
    map[key].totals.tulasi_parikrama += r.tulasi_parikrama || 0;
    map[key].totals.tulasi_offered += r.tulasi_offered || 0;
  }
  res.json(Object.values(map));
});

// ── By Devotee ─────────────────────────────────────────
app.get("/api/by-devotee", async (_req, res) => {
  if (DB_READY) {
    const { data } = await supabase.from("devotee_activities").select("*").order("devotee_name").order("date", { ascending: false });
    const rows = data || [];
    const map = {};
    for (const r of rows) {
      const key = r.devotee_name;
      if (!map[key]) map[key] = { devotee_name: key, entries: [], totals: { chanting: 0, narasimha_kavach: 0, tulasi_parikrama: 0, tulasi_offered: 0 } };
      map[key].entries.push(r);
      map[key].totals.chanting += r.chanting || 0;
      map[key].totals.narasimha_kavach += r.narasimha_kavach || 0;
      map[key].totals.tulasi_parikrama += r.tulasi_parikrama || 0;
      map[key].totals.tulasi_offered += r.tulasi_offered || 0;
    }
    return res.json(Object.values(map));
  }

  const rows = mock.devoteeActivities.slice().sort((a, b) => a.devotee_name.localeCompare(b.devotee_name) || b.date.localeCompare(a.date));
  const map = {};
  for (const r of rows) {
    const key = r.devotee_name;
    if (!map[key]) map[key] = { devotee_name: key, entries: [], totals: { chanting: 0, narasimha_kavach: 0, tulasi_parikrama: 0, tulasi_offered: 0 } };
    map[key].entries.push(r);
    map[key].totals.chanting += r.chanting || 0;
    map[key].totals.narasimha_kavach += r.narasimha_kavach || 0;
    map[key].totals.tulasi_parikrama += r.tulasi_parikrama || 0;
    map[key].totals.tulasi_offered += r.tulasi_offered || 0;
  }
  res.json(Object.values(map));
});

// ── Activities (flat list) ─────────────────────────────
app.get("/api/activities", async (_req, res) => {
  if (DB_READY) {
    const { data } = await supabase.from("devotee_activities").select("*").order("date", { ascending: false }).limit(100);
    return res.json(data || []);
  }
  res.json(mock.devoteeActivities.slice().sort((a, b) => b.date.localeCompare(a.date)));
});

// ── Google Sheets Webhook ─────────────────────────────
app.post("/api/webhook/sheets", async (req, res) => {
  const { rows, secret } = req.body;
  if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: "rows array required" });
  if (process.env.SHEETS_SECRET && secret !== process.env.SHEETS_SECRET) return res.status(401).json({ error: "Invalid secret" });

  if (DB_READY) {
    for (const row of rows) {
      const { data: existing } = await supabase.from("devotee_activities").select("id").eq("date", row.date).eq("devotee_name", row.devotee_name).maybeSingle();
      if (existing) {
        await supabase.from("devotee_activities").update({
          chanting: row.chanting || 0,
          narasimha_kavach: row.narasimha_kavach || 0,
          tulasi_parikrama: row.tulasi_parikrama || 0,
          tulasi_offered: row.tulasi_offered || 0,
          updated_at: new Date().toISOString()
        }).eq("id", existing.id);
      } else {
        await supabase.from("devotee_activities").insert({
          date: row.date,
          devotee_name: row.devotee_name || "",
          chanting: row.chanting || 0,
          narasimha_kavach: row.narasimha_kavach || 0,
          tulasi_parikrama: row.tulasi_parikrama || 0,
          tulasi_offered: row.tulasi_offered || 0
        });
      }
    }
    return res.json({ ok: true, count: rows.length });
  }

  for (const row of rows) {
    const idx = mock.devoteeActivities.findIndex(a => a.date === row.date && a.devotee_name === row.devotee_name);
    const entry = {
      id: ++nextId,
      date: row.date,
      devotee_name: row.devotee_name || "",
      chanting: row.chanting || 0,
      narasimha_kavach: row.narasimha_kavach || 0,
      tulasi_parikrama: row.tulasi_parikrama || 0,
      tulasi_offered: row.tulasi_offered || 0,
      created_at: new Date().toISOString()
    };
    if (idx > -1) mock.devoteeActivities[idx] = entry;
    else mock.devoteeActivities.unshift(entry);
  }
  res.json({ ok: true, count: rows.length });
});

// ── SPA fallback ──────────────────────────────────────
app.get("*", (_req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

app.listen(PORT, () => { console.log("Server running at http://localhost:" + PORT); });
