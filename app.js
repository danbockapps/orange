(function(){
  var app = angular.module('orange', ['ngRoute']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/welcome', {
        templateUrl: 'partials/welcome.html',
        controller: 'WelcomeController'
      }).
      otherwise({
        redirectTo: '/welcome'
      });
  }]);

  app.controller("OrangeController", ["$http", function($http) {
    var o = this;
    $http.get("init.php").success(function(data) {
      o.projectname = data.projectname;
      o.userid = data.userid;
    });
  }]);

  app.controller("WelcomeController", ["$http", function($http) {
    var o = this;
    this.submitRegisterForm = function () {      
      phpObj = {
        email:o.email,
        password:o.password1
      };
      
      $http.post("register.php", phpObj).success(function(data) {
        console.log("app.js says register.php had success:");
        console.log(data);
      });
    };
  }]);
  
})();
