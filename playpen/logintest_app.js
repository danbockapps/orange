(function(){
  var app = angular.module('orange', []);
  
  app.controller("OrangeController", ["$http", function($http) {
    var o = this;
    console.log(o);
    
    this.loginSubmit = function() {
      console.log(o);
      $http.post("logintest.php", {email:o.email, password:o.password}).success(function(data) {
        console.log(data);
      });
    };
    
    
    /*
    o.products = [];
    $http.get("json.php").success(function(data) {
      o.products = data;
      console.log(data);
    });
    */
  }]);
})();
