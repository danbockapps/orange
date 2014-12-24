var app = angular.module('orange', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/welcome', {
      templateUrl: 'partials/welcome.html',
      controller: 'WelcomeCtrl'
    }).
    when('/emailsent', {
      templateUrl: 'partials/emailsent.html'
    }).
    when('/activate/:key', {
      templateUrl: 'partials/activate.html',
      controller: 'ActivateCtrl'
    }).
    otherwise({
      redirectTo: '/welcome'
    });
}]);

function IndexCtrl($rootScope, $scope, $http) {
  $http.get("api.php?q=init").success(function(data) {
    $scope.projectname = data.projectname;
    $scope.userid = data.userid;
    $rootScope.projectname = data.projectname;
  });
}

function WelcomeCtrl($scope, $http, $location) {
  $scope.submitRegisterForm = function () {
    if(typeof($scope.password1) === "undefined" || $scope.password1.length < 8) {
      $scope.regErrorMsg = "Your password must be at least 8 characters.";
      $("#RegError").modal();
    }
    else if($scope.password1 !== $scope.password2) {
      $scope.regErrorMsg = "Your password entries do not match.";
      $("#RegError").modal();
    }

    else {
      // Send a register API request
      $scope.disableRegForm = true;

      phpObj = {
        email:$scope.regEmail,
        password:$scope.password1,
        recaptcha_response:grecaptcha.getResponse()
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
            $scope.regErrorMsg = "There is already an account with that email " +
              "address. Please log in or click here if you have forgotten " +
              "your password."

          else if(data.responsecode === 5)
            $scope.regErrorMsg = "Recaptcha thinks you are a robot. Please " +
              "try again.";

          else
            $scope.regErrorMsg = "There was an error with creating your account.";

          $("#RegError").modal();
          $scope.disableRegForm = false;
        }
      });
    }
  };
}

function ActivateCtrl($scope, $http, $routeParams) {
  $http.get("api.php?q=check_key", {params:{key:$routeParams.key}})
      .success(function(data) {
    console.log(data);
    if(data.responsestring == "ERROR") {
      $scope.showBadKeyMsg = true;
    }
    else if(data.responsestring == "OK") {
      $scope.showSurvey = true;
      $scope.$parent.hideLoginForm = true;
      actEmail = data.email;
    }
  });

  $scope.submitActForm = function() {
    $scope.disableActForm = true;
    $http.post("api.php?q=activate", {
      fname:$scope.actFname, 
      lname:$scope.actLname, 
      email:actEmail, 
      key:$routeParams.key
    }).success(function(data) {
      console.log(data);
      $scope.showSurvey = false;
      $scope.showCompleteMsg = true;
      $scope.$parent.hideLoginForm = false;
    });
  };
}

// If you're not minifying, you can replace the array literal with just the 
// function name.
app.controller("IndexCtrl", ["$rootScope", "$scope", "$http", IndexCtrl]);
app.controller("WelcomeCtrl", ["$scope", "$http", "$location", WelcomeCtrl]);
app.controller("ActivateCtrl", ["$scope", "$http", "$routeParams", ActivateCtrl]);