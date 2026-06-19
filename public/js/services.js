app.factory("Auth", function() {
  var user = null;
  return {
    getUser: function() { return user; },
    setUser: function(u) { user = u; },
    clear: function() { user = null; }
  };
});
