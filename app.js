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
      if(o.password1.length < 8) {
        o.regErrorMsg = "Your password must be at least 8 characters.";
        $("#RegError").modal();
      }
      else if(o.password1 !== o.password2) {
        o.regErrorMsg = "Your password entries do not match.";
        $("#RegError").modal();
      }
      
      else {
      
        phpObj = {
          email:o.email,
          password:o.password1
        };

        $http.post("register.php", phpObj).success(function(data) {
          console.log("response: " + data.responsestring);
          console.log(data);

          if(data.responsestring === "OK") {
            // redirect to another page
          }
          else {
            // there was an error

            if(data.responsecode === 2)
              o.regErrorMsg = "There is already an account with that email " +
                "address. Please log in or click here if you have forgotten " +
                "your password."

            else
              o.regErrorMsg = "There was an error with creating your account.";

            $("#RegError").modal();
          }
        });
      }
      
      
      
    };
  }]);
  
})();
