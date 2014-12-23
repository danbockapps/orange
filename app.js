(function(){
  var app = angular.module('orange', ['ngRoute']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/welcome', {
        templateUrl: 'partials/welcome.html'
      }).
      when('/emailsent', {
        templateUrl: 'partials/emailsent.html'
      }).
      when('/activate/:key', {
        templateUrl: 'partials/activate.html'
      }).
      otherwise({
        redirectTo: '/welcome'
      });
  }]);

  app.controller("OrangeController", ["$http", function($http) {
    var o = this;
    $http.get("api.php?q=init").success(function(data) {
      o.projectname = data.projectname;
      o.userid = data.userid;
    });
  }]);

  app.controller("WelcomeController",
                 ["$http", "$location", function($http, $location) {
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
        // Send a register API request
        
        o.disableForm = true;
        
        phpObj = {
          email:o.email,
          password:o.password1
        };

        $http.post("api.php?q=register", phpObj).success(function(data) {
          console.log(data);

          if(data.responsestring === "OK") {
            // redirect to another page
            $location.path('emailsent');
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
            o.disableForm = false;
          }
        });
      }
    };
  }]);
  
  app.controller("ActivateController", 
                 ["$http", "$routeParams", function($http, $routeParams) {
    var o = this;
    $http.post("api.php?q=activate", {key:$routeParams.key}).success(function(data) {
      console.log(data);
      if(data.responsestring == "ERROR") {
        o.regError = true;
      }
      else if(data.responsestring == "OK") {
        o.survey = true;
      }
    });
  }]);
  
})();
