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
      console.log(o);
//      console.log("submitRegisterForm called.");
//      console.log("email is: " + o.email);
    };
  }]);
  
})();
