app.factory("Api", ["$q", "$rootScope", function($q, $rootScope) {
  return {
    request: function(method, url, body) {
      var deferred = $q.defer();
      var opts = { method: method, headers: { "Content-Type": "application/json" } };
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

app.controller("DashboardCtrl", ["$scope", "$interval", "Api", function($scope, $interval, Api) {
  $scope.summary = {};
  $scope.byDate = [];
  $scope.byDevotee = [];
  $scope.activities = [];
  $scope.loading = true;
  $scope.expanded = {};

  function load() {
    Api.request("GET", "/api/summary").then(function(d) { $scope.summary = d; $scope.loading = false; });
    Api.request("GET", "/api/by-date").then(function(d) { $scope.byDate = d; });
    Api.request("GET", "/api/by-devotee").then(function(d) { $scope.byDevotee = d; });
    Api.request("GET", "/api/activities").then(function(d) { $scope.activities = d; });
  }

  $scope.toggle = function(section, key) {
    if (!$scope.expanded[section]) $scope.expanded[section] = {};
    $scope.expanded[section][key] = !$scope.expanded[section][key];
  };

  $scope.isExpanded = function(section, key) {
    return $scope.expanded[section] && $scope.expanded[section][key];
  };

  load();
  var poll = $interval(load, 30000);
  $scope.$on("$destroy", function() { $interval.cancel(poll); });
}]);
