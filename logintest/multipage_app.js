(function(){
  var app = angular.module('multipage', ['ngRoute']);
  
  app.config(['$routeProvider', function($routeProvider) {
    console.log("config routeprovider");
    $routeProvider.
      when('/r1', {
        templateUrl: 'content1.html',
        controller: 'Content1Controller'
      }).
      when('/r2', {
        templateUrl: 'content2.html',
        controller: 'Content2Controller'
      }).
      otherwise({

      });
  }]);

  app.controller("Content1Controller", function() {
    console.log("Content1Controller");
  });

  app.controller("Content2Controller", function() {
    console.log("Content2Controller");
  });

  app.controller("MultipageController", ["$http", function($http) {
    var o = this;
    o.products = [];
    $http.get("json.php").success(function(data) {
      o.products = data;
      console.log(data);
    });
    
    this.loginSubmit = function() {
      $http.post("logintest.php", {email:o.email, password:o.password}).success(function(data) {
        console.log(data);
      });
    };
    
  }]);
})();
