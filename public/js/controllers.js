app.factory("Api", ["$q", "$rootScope", function($q, $rootScope) {
  return {
    request: function(method, url, body) {
      var deferred = $q.defer();
      var opts = { method: method, credentials: "include", headers: { "Content-Type": "application/json" } };
      if (body) opts.body = JSON.stringify(body);
      fetch(url, opts).then(function(r) {
        return r.json().then(function(d) {
          $rootScope.$applyAsync(function() {
            if (!r.ok) deferred.reject(d);
            else deferred.resolve(d);
          });
        });
      }).catch(function(e) {
        $rootScope.$applyAsync(function() { deferred.reject(e); });
      });
      return deferred.promise;
    }
  };
}]);

// ── Login ─────────────────────────────────────────────
app.controller("LoginCtrl", ["$scope", "$location", "Auth", "Api", function($scope, $location, Auth, Api) {
  $scope.f = { email: "", password: "" };
  $scope.error = "";
  $scope.loading = false;
  $scope.showPw = false;

  $scope.login = function() {
    $scope.error = "";
    if (!$scope.f.email || !$scope.f.password) { $scope.error = "Email and password required"; return; }
    $scope.loading = true;
    Api.request("POST", "/api/auth/login", { email: $scope.f.email, password: $scope.f.password })
      .then(function(d) { Auth.setUser(d.user); $location.path("/dashboard"); })
      .catch(function(e) { $scope.error = e.error || "Login failed"; })
      .finally(function() { $scope.loading = false; });
  };
}]);

// ── Register ──────────────────────────────────────────
app.controller("RegisterCtrl", ["$scope", "$location", "Api", function($scope, $location, Api) {
  $scope.f = { name: "", email: "", password: "" };
  $scope.error = "";
  $scope.success = "";
  $scope.loading = false;
  $scope.showPw = false;

  $scope.register = function() {
    $scope.error = "";
    $scope.success = "";
    if (!$scope.f.email || !$scope.f.password) { $scope.error = "Email and password required"; return; }
    if ($scope.f.password.length < 6) { $scope.error = "Password must be at least 6 characters"; return; }
    $scope.loading = true;
    Api.request("POST", "/api/auth/register", { name: $scope.f.name, email: $scope.f.email, password: $scope.f.password })
      .then(function(d) {
        if (d.user) { $scope.success = "Account created!"; }
        else { $scope.error = d.message || "Registration failed"; }
      })
      .catch(function(e) { $scope.error = e.error || "Registration failed"; })
      .finally(function() { $scope.loading = false; });
  };
}]);

// ── Dashboard ─────────────────────────────────────────
app.controller("DashboardCtrl", ["$scope", "$interval", "Api", function($scope, $interval, Api) {
  $scope.summary = {};
  $scope.activities = [];
  $scope.loading = true;

  function load() {
    Api.request("GET", "/api/dashboard/summary").then(function(d) { $scope.summary = d; $scope.loading = false; });
    Api.request("GET", "/api/dashboard/activity").then(function(d) { $scope.activities = d; });
  }

  load();
  var poll = $interval(load, 30000);
  $scope.$on("$destroy", function() { $interval.cancel(poll); });
}]);

// ── Admin ─────────────────────────────────────────────
app.controller("AdminCtrl", ["$scope", "Api", function($scope, Api) {
  $scope.tab = "zoom";
  $scope.zoom = { meetingId: "", title: "", date: "", csv: "", preview: [], error: "", success: "", sessions: [] };
  $scope.rounds = { form: { devoteeName: "", rounds: "", date: "", note: "" }, entries: [], editing: null, error: "", success: "" };
  $scope.users = [];

  $scope.setTab = function(t) { $scope.tab = t; };

  // ── Zoom ──
  function parseCSV(text) {
    var lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    var h = lines[0].split(",").map(function(s) { return s.trim().toLowerCase(); });
    var ni = h.indexOf("name (original name)"); if (ni < 0) ni = h.indexOf("name");
    var ei = h.indexOf("user email"); if (ei < 0) ei = h.indexOf("email");
    var ji = h.indexOf("join time");
    var di = h.indexOf("duration (minutes)"); if (di < 0) di = h.indexOf("duration");
    return lines.slice(1).filter(function(l) { return l.trim(); }).map(function(l) {
      var c = l.split(",");
      return { name: (c[ni] || "").trim(), email: ei > -1 ? (c[ei] || "").trim() : "", joinTime: ji > -1 ? (c[ji] || "").trim() : "", durationMinutes: di > -1 ? parseInt(c[di]) || 0 : 0 };
    }).filter(function(a) { return a.name; });
  }

  $scope.previewCSV = function() {
    $scope.zoom.preview = parseCSV($scope.zoom.csv).slice(0, 5);
  };

  $scope.uploadZoom = function() {
    $scope.zoom.error = ""; $scope.zoom.success = "";
    var att = parseCSV($scope.zoom.csv);
    if (!att.length) { $scope.zoom.error = "No valid attendees in CSV"; return; }
    if (!$scope.zoom.meetingId) { $scope.zoom.error = "Meeting ID required"; return; }
    Api.request("POST", "/api/admin/zoom/upload", { meetingId: $scope.zoom.meetingId, title: $scope.zoom.title || "Narasimha Kavach Session", date: $scope.zoom.date || new Date().toISOString(), attendees: att })
      .then(function(d) {
        var newSession = { id: d.session.id, meeting_id: d.session.meeting_id, title: d.session.title, date: d.session.date, created_at: d.session.created_at, attendees: [{ count: d.count }] };
        $scope.zoom.sessions = [newSession].concat($scope.zoom.sessions);
        $scope.zoom.success = "Uploaded " + d.count + " attendees!"; $scope.zoom.csv = ""; $scope.zoom.preview = []; $scope.zoom.meetingId = ""; $scope.zoom.title = ""; $scope.zoom.date = "";
      })
      .catch(function(e) { $scope.zoom.error = e.error || "Upload failed"; });
  };

  function loadSessions() { Api.request("GET", "/api/admin/zoom/sessions").then(function(d) { $scope.zoom.sessions = d; }); }
  loadSessions();

  $scope.deleteSession = function(id) {
    if (!confirm("Delete this session and all attendance?")) return;
    Api.request("DELETE", "/api/admin/zoom/sessions/" + id).then(function() { $scope.zoom.sessions = $scope.zoom.sessions.filter(function(s) { return s.id !== id; }); });
  };

  // ── Rounds ──
  function loadRounds() { Api.request("GET", "/api/admin/extra-rounds").then(function(d) { $scope.rounds.entries = d; }); }
  loadRounds();

  $scope.addRound = function() {
    $scope.rounds.error = ""; $scope.rounds.success = "";
    if (!$scope.rounds.form.devoteeName || !$scope.rounds.form.rounds) { $scope.rounds.error = "Name and rounds required"; return; }
    Api.request("POST", "/api/admin/extra-rounds", { devoteeName: $scope.rounds.form.devoteeName, rounds: parseInt($scope.rounds.form.rounds), date: $scope.rounds.form.date || new Date().toISOString(), note: $scope.rounds.form.note })
      .then(function(d) { $scope.rounds.entries = [d].concat($scope.rounds.entries); $scope.rounds.success = "Added!"; $scope.rounds.form = { devoteeName: "", rounds: "", date: "", note: "" }; })
      .catch(function(e) { $scope.rounds.error = e.error || "Failed"; });
  };

  $scope.editEntry = function(e) { $scope.rounds.editing = { id: e.id, devotee_name: e.devotee_name, rounds: e.rounds, date: e.date, note: e.note }; };
  $scope.saveEntry = function() {
    var r = $scope.rounds.editing;
    Api.request("PUT", "/api/admin/extra-rounds/" + r.id, { devoteeName: r.devotee_name, rounds: r.rounds, date: r.date, note: r.note })
      .then(function(d) {
        var idx = $scope.rounds.entries.findIndex(function(e) { return e.id === d.id; });
        if (idx > -1) $scope.rounds.entries[idx] = d;
        $scope.rounds.editing = null;
      });
  };
  $scope.deleteEntry = function(id) {
    if (!confirm("Delete?")) return;
    Api.request("DELETE", "/api/admin/extra-rounds/" + id).then(function() { $scope.rounds.entries = $scope.rounds.entries.filter(function(e) { return e.id !== id; }); });
  };

  // ── Users ──
  function loadUsers() { Api.request("GET", "/api/admin/users").then(function(d) { $scope.users = d; }); }
  loadUsers();
  $scope.changeRole = function(u, role) {
    if (!confirm("Change " + u.name + " to " + role + "?")) return;
    Api.request("PUT", "/api/admin/users/" + u.id, { role: role }).then(function(d) {
      var idx = $scope.users.findIndex(function(x) { return x.id === d.id; });
      if (idx > -1) $scope.users[idx] = d;
    });
  };
}]);
