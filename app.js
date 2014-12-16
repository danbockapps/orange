(function(){
  var app = angular.module('orange', []);
  
  app.controller("OrangeController", ["$http", function($http) {
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