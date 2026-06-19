require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DB_READY = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes("your-project");

let supabase = null;
let createClient;
if (DB_READY) {
  createClient = require("@supabase/supabase-js").createClient;
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  console.log("Connected to Supabase");
} else {
  console.log("WARNING: Supabase not configured. Running in DEMO mode with mock data.");
  console.log("Edit .env with your Supabase credentials to use real data.");
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ── Mock data for demo mode ───────────────────────────
let nextId = 100;
const mock = {
  users: [
    { id: "u1", name: "Admin", email: "admin@iskcon.org", role: "admin", created_at: new Date().toISOString() },
    { id: "u2", name: "Viewer", email: "viewer@iskcon.org", role: "viewer", created_at: new Date().toISOString() },
  ],
  zoomSessions: [
    { id: 1, meeting_id: "DEMO-001", title: "Narasimha Kavach Session", date: "2026-06-15T10:00:00Z", created_at: "2026-06-15T10:00:00Z", attendees: [{ count: 45 }] },
    { id: 2, meeting_id: "DEMO-002", title: "Narasimha Kavach Session", date: "2026-06-16T10:00:00Z", created_at: "2026-06-16T10:00:00Z", attendees: [{ count: 52 }] },
    { id: 3, meeting_id: "DEMO-003", title: "Narasimha Kavach Session", date: "2026-06-17T10:00:00Z", created_at: "2026-06-17T10:00:00Z", attendees: [{ count: 38 }] },
  ],
  extraRounds: [
    { id: 1, devotee_name: "Ram Das", rounds: 16, date: "2026-06-17", note: "For Gurumaharaj recovery", added_by: "u1", created_at: "2026-06-17T12:00:00Z" },
    { id: 2, devotee_name: "Shyama Priya", rounds: 8, date: "2026-06-17", note: "", added_by: "u1", created_at: "2026-06-17T13:00:00Z" },
    { id: 3, devotee_name: "Govinda Das", rounds: 32, date: "2026-06-18", note: "Extra rounds for Srila Gurudev", added_by: "u1", created_at: "2026-06-18T09:00:00Z" },
  ],
};

// ── Auth helpers ──────────────────────────────────────
async function getUser(req) {
  const token = req.cookies?.sb_token;
  if (!token) return null;

  if (DB_READY) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    const { data: profile } = await supabase.from("profiles").select("role, name").eq("id", user.id).single();
    return { id: user.id, email: user.email, role: profile?.role || "viewer", name: profile?.name || user.email };
  }

  // Demo mode: accept any token that looks like "demo-admin" or "demo-viewer"
  if (token === "demo-admin") return { id: "u1", email: "admin@iskcon.org", role: "admin", name: "Admin" };
  if (token === "demo-viewer") return { id: "u2", email: "viewer@iskcon.org", role: "viewer", name: "Viewer" };
  return null;
}

function requireAuth(roles) {
  return async (req, res, next) => {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    if (roles && !roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  };
}

// ── Auth ──────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (DB_READY) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    res.cookie("sb_token", data.session.access_token, { httpOnly: true, sameSite: "lax", maxAge: 604800000 });
    const { data: profile } = await supabase.from("profiles").select("role, name").eq("id", data.user.id).single();
    return res.json({ user: { id: data.user.id, email: data.user.email, role: profile?.role || "viewer", name: profile?.name || data.user.email } });
  }

  // Demo mode
  if (email === "admin@iskcon.org" && password === "admin@123") {
    res.cookie("sb_token", "demo-admin", { httpOnly: true, sameSite: "lax", maxAge: 604800000 });
    return res.json({ user: mock.users[0] });
  }
  if (email === "viewer@iskcon.org" && password === "admin123") {
    res.cookie("sb_token", "demo-viewer", { httpOnly: true, sameSite: "lax", maxAge: 604800000 });
    return res.json({ user: mock.users[1] });
  }
  res.status(401).json({ error: "Invalid credentials. Demo: admin@iskcon.org / admin123" });
});

app.post("/api/auth/logout", (_req, res) => { res.clearCookie("sb_token"); res.json({ ok: true }); });
app.get("/api/auth/me", requireAuth(), (req, res) => { res.json({ user: req.user }); });

// ── Register ────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  if (DB_READY) {
    // Use admin API to create confirmed user (bypasses email confirmation)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split("@")[0] }
    });
    if (createError) return res.status(400).json({ error: createError.message });

    // Profile is auto-created by the trigger, update the name
    if (userData.user) {
      await supabase.from("profiles").update({ name: name || email.split("@")[0], email }).eq("id", userData.user.id);
    }

    // Now sign them in
    const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: sessionData, error: loginError } = await anonClient.auth.signInWithPassword({ email, password });
    if (loginError) return res.status(400).json({ error: loginError.message });

    res.cookie("sb_token", sessionData.session.access_token, { httpOnly: true, sameSite: "lax", maxAge: 604800000 });
    const { data: profile } = await supabase.from("profiles").select("role, name").eq("id", userData.user.id).single();
    return res.json({ user: { id: userData.user.id, email: userData.user.email, role: profile?.role || "viewer", name: profile?.name || email } });
  }

  // Demo mode
  if (mock.users.find(u => u.email === email)) return res.status(409).json({ error: "Email already registered" });
  const newUser = { id: "u" + (++nextId), name: name || email.split("@")[0], email, role: "viewer", created_at: new Date().toISOString() };
  mock.users.push(newUser);
  res.cookie("sb_token", "demo-viewer", { httpOnly: true, sameSite: "lax", maxAge: 604800000 });
  res.json({ user: newUser });
});

// ── Dashboard ─────────────────────────────────────────
app.get("/api/dashboard/summary", requireAuth(), async (_req, res) => {
  if (DB_READY) {
    const { count: sessions } = await supabase.from("zoom_sessions").select("*", { count: "exact", head: true });
    const { count: participants } = await supabase.from("zoom_attendance").select("*", { count: "exact", head: true });
    const { data: roundsData } = await supabase.from("extra_rounds").select("rounds");
    const totalRounds = roundsData?.reduce((s, r) => s + r.rounds, 0) || 0;
    return res.json({ sessions: sessions || 0, participants: participants || 0, extraRounds: totalRounds, combined: (participants || 0) + totalRounds });
  }
  const sessions = mock.zoomSessions.length;
  const participants = mock.zoomSessions.reduce((s, z) => s + (z.attendees?.[0]?.count || 0), 0);
  const extraRounds = mock.extraRounds.reduce((s, r) => s + r.rounds, 0);
  res.json({ sessions, participants, extraRounds, combined: participants + extraRounds });
});

app.get("/api/dashboard/activity", requireAuth(), async (_req, res) => {
  if (DB_READY) {
    const { data: z } = await supabase.from("zoom_sessions").select("id, title, date, created_at, attendees:zoom_attendance(count)").order("created_at", { ascending: false }).limit(10);
    const { data: e } = await supabase.from("extra_rounds").select("id, devotee_name, rounds, date, created_at").order("created_at", { ascending: false }).limit(10);
    const acts = [
      ...(z || []).map(r => ({ type: "zoom", label: r.title, date: r.date?.slice(0, 10), count: r.attendees?.[0]?.count || 0, created_at: r.created_at })),
      ...(e || []).map(r => ({ type: "extra", label: "Devotee: " + r.devotee_name, date: r.date?.slice(0, 10), count: r.rounds, created_at: r.created_at })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json(acts.slice(0, 10));
  }
  const acts = [
    ...mock.zoomSessions.map(z => ({ type: "zoom", label: z.title, date: z.date?.slice(0, 10), count: z.attendees?.[0]?.count || 0, created_at: z.created_at })),
    ...mock.extraRounds.map(e => ({ type: "extra", label: "Devotee: " + e.devotee_name, date: e.date, count: e.rounds, created_at: e.created_at })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(acts.slice(0, 10));
});

// ── Admin: Zoom Upload ────────────────────────────────
app.post("/api/admin/zoom/upload", requireAuth(["admin"]), async (req, res) => {
  const { meetingId, title, date, attendees } = req.body;
  if (!meetingId || !attendees?.length) return res.status(400).json({ error: "meetingId and attendees required" });

  if (DB_READY) {
    const { data: existing } = await supabase.from("zoom_sessions").select("id").eq("meeting_id", meetingId).maybeSingle();
    if (existing) return res.status(409).json({ error: "Meeting already uploaded" });
    const { data: session, error: se } = await supabase.from("zoom_sessions").insert({ meeting_id: meetingId, title, date }).select().single();
    if (se) return res.status(500).json({ error: se.message });

    function parseJoinTime(timeStr, sessionDate) {
      if (!timeStr) return null;
      try {
        if (/T/.test(timeStr)) return timeStr;
        const baseDate = sessionDate || new Date().toISOString().slice(0, 10);
        const d = new Date(baseDate + "T" + timeStr);
        if (!isNaN(d.getTime())) return d.toISOString();
        const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const s = parseInt(match[3] || "0", 10);
          const ampm = match[4];
          if (ampm) {
            if (/pm/i.test(ampm) && h < 12) h += 12;
            if (/am/i.test(ampm) && h === 12) h = 0;
          }
          const iso = `${baseDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}Z`;
          return iso;
        }
      } catch (_) {}
      return null;
    }

    const rows = attendees.map(a => ({
      session_id: session.id,
      participant_name: a.name,
      email: a.email || null,
      join_time: parseJoinTime(a.joinTime, date),
      duration_minutes: a.durationMinutes || null
    }));
    const { error: ae } = await supabase.from("zoom_attendance").insert(rows);
    if (ae) return res.status(500).json({ error: ae.message });
    return res.json({ session, count: rows.length });
  }

  // Demo mode
  if (mock.zoomSessions.find(s => s.meeting_id === meetingId)) return res.status(409).json({ error: "Meeting already uploaded" });
  const session = { id: ++nextId, meeting_id: meetingId, title, date, created_at: new Date().toISOString(), attendees: [{ count: attendees.length }] };
  mock.zoomSessions.unshift(session);
  res.json({ session, count: attendees.length });
});

app.get("/api/admin/zoom/sessions", requireAuth(["admin"]), async (_req, res) => {
  if (DB_READY) {
    const { data, error } = await supabase.from("zoom_sessions").select("id, meeting_id, title, date, created_at, attendees:zoom_attendance(count)").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  res.json(mock.zoomSessions);
});

app.delete("/api/admin/zoom/sessions/:id", requireAuth(["admin"]), async (req, res) => {
  if (DB_READY) {
    const { error } = await supabase.from("zoom_sessions").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }
  mock.zoomSessions = mock.zoomSessions.filter(s => s.id !== Number(req.params.id));
  res.json({ ok: true });
});

// ── Admin: Extra Rounds ───────────────────────────────
app.get("/api/admin/extra-rounds", requireAuth(["admin"]), async (_req, res) => {
  if (DB_READY) {
    const { data, error } = await supabase.from("extra_rounds").select("id, devotee_name, rounds, date, note, created_at, added_by").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  res.json(mock.extraRounds);
});

app.post("/api/admin/extra-rounds", requireAuth(["admin"]), async (req, res) => {
  const { devoteeName, rounds, date, note } = req.body;
  if (!devoteeName || !rounds) return res.status(400).json({ error: "devoteeName and rounds required" });

  if (DB_READY) {
    const { data, error } = await supabase.from("extra_rounds").insert({ devotee_name: devoteeName, rounds, date, note, added_by: req.user.id }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const entry = { id: ++nextId, devotee_name: devoteeName, rounds, date: date || new Date().toISOString().slice(0, 10), note: note || "", added_by: req.user.id, created_at: new Date().toISOString() };
  mock.extraRounds.unshift(entry);
  res.json(entry);
});

app.put("/api/admin/extra-rounds/:id", requireAuth(["admin"]), async (req, res) => {
  const { devoteeName, rounds, date, note } = req.body;

  if (DB_READY) {
    const { data, error } = await supabase.from("extra_rounds").update({ devotee_name: devoteeName, rounds, date, note }).eq("id", req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const idx = mock.extraRounds.findIndex(e => e.id === Number(req.params.id));
  if (idx > -1) { mock.extraRounds[idx] = { ...mock.extraRounds[idx], devotee_name: devoteeName, rounds, date, note }; }
  res.json(mock.extraRounds[idx] || {});
});

app.delete("/api/admin/extra-rounds/:id", requireAuth(["admin"]), async (req, res) => {
  if (DB_READY) {
    const { error } = await supabase.from("extra_rounds").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }
  mock.extraRounds = mock.extraRounds.filter(e => e.id !== Number(req.params.id));
  res.json({ ok: true });
});

// ── Admin: Users ──────────────────────────────────────
app.get("/api/admin/users", requireAuth(["admin"]), async (_req, res) => {
  if (DB_READY) {
    const { data, error } = await supabase.from("profiles").select("id, name, email, role, created_at");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  res.json(mock.users);
});

app.put("/api/admin/users/:id", requireAuth(["admin"]), async (req, res) => {
  const { role } = req.body;
  if (!["viewer", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });

  if (DB_READY) {
    const { data, error } = await supabase.from("profiles").update({ role }).eq("id", req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const u = mock.users.find(u => u.id === req.params.id);
  if (u) u.role = role;
  res.json(u || {});
});

// ── SPA fallback ──────────────────────────────────────
app.get("*", (_req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

app.listen(PORT, () => { console.log("Server running at http://localhost:" + PORT); });
