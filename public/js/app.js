var app = angular.module("kavachApp", ["ngRoute"]);

app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix("");
  $routeProvider
    .when("/login", { templateUrl: "/views/login.html", controller: "LoginCtrl" })
    .when("/register", { templateUrl: "/views/register.html", controller: "RegisterCtrl" })
    .when("/dashboard", { templateUrl: "/views/dashboard.html", controller: "DashboardCtrl" })
    .when("/admin", { templateUrl: "/views/admin.html", controller: "AdminCtrl" })
    .otherwise({ redirectTo: "/login" });
}]);

app.run(["$rootScope", "$location", "Auth", function($rootScope, $location, Auth) {
  $rootScope.auth = Auth;

  $rootScope.logout = function() {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(function() {
      Auth.clear();
      $rootScope.$applyAsync(function() { $location.path("/login"); });
    });
  };

  $rootScope.$on("$routeChangeStart", function() {
    $rootScope.path = $location.path();
    if ($location.path() === "/login" || $location.path() === "/register") return;
    if (Auth.getUser()) return;

    fetch("/api/auth/me", { credentials: "include" }).then(function(r) {
      return r.json();
    }).then(function(data) {
      if (data.user) { Auth.setUser(data.user); }
      else { $rootScope.$applyAsync(function() { $location.path("/login"); }); }
    }).catch(function() {
      $rootScope.$applyAsync(function() { $location.path("/login"); });
    });
  });
}]);
