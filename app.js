(function(){
  var app = angular.module('orange', ['ngRoute']);
  
  app.config(['$routeProvider', function($routeProvider) {
    console.log("config starting");
    $routeProvider.
      when('/welcome', {
        templateUrl: 'partials/welcome.html',
        controller: 'WelcomeController'
      }).
      otherwise({
        redirectTo: '/welcome'
      });
      console.log("config ending");
  }]);
  
  app.controller("OrangeController", ["$http", function($http) {
    //TODO download project name and login status, among other things
  }]);
  
  app.controller("WelcomeController", function() {
  });
})();
