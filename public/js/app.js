var app = angular.module("kavachApp", ["ngRoute"]);

app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix("");
  $routeProvider
    .when("/", { templateUrl: "/views/dashboard.html", controller: "DashboardCtrl" })
    .otherwise({ redirectTo: "/" });
}]);
