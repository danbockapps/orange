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
    when('/passwordrecover/', {
      templateUrl: 'partials/passwordrecover.html',
      controller: 'PasswordRecoverCtrl'
    }).
    when('/passwordrecover/:key', {
      templateUrl: 'partials/passwordrecover.html',
      controller: 'PasswordRecoverCtrl'
    }).
    when('/dashboard', {
      templateUrl: 'partials/dashboard.html',
      controller: 'DashboardCtrl'
    }).
    otherwise({
      redirectTo: '/welcome'
    });
}]);

function phpInit($rootScope, $scope, $http) {
  $http.get("api.php?q=init").success(function(data) {
    console.log(data);
    $scope.projectname = data.projectname;
    $rootScope.projectname = data.projectname;
    
    if(data.userid == null) {
      $scope.hideLoginForm = false;
      $scope.showUserName = false;
      $scope.userid = null;
      $scope.loggedInFname = null;
      $scope.loggedInLname = null;
    }
    else {
      $scope.hideLoginForm = true;
      $scope.showUserName = true;
      $scope.userid = data.userid;
      $scope.loggedInFname = data.fname;
      $scope.loggedInLname = data.lname;
    }
  });
}

function IndexCtrl($rootScope, $scope, $http, $location) {
  phpInit($rootScope, $scope, $http);
  
  $scope.submitLoginForm = function() {
    phpObj = {email:$scope.loginEmail, password:$scope.loginPassword};
    $http.post("api.php?q=login", phpObj).success(function(data){
      console.log(data);
      if(data.responsestring == "ERROR") {
        
        // Reset modal
        $scope.showNonActivateError = false;
        $scope.showWrongPasswordError = false;
        $scope.showUserNotFoundError = false;
        $scope.showUnknownError = false;
        
        if(data.responsecode == 6) {
          // Account not activated
          $scope.showNonActivateError = true;
        }
        else if(data.responsecode == 7) {
          // Wrong password
          $scope.showWrongPasswordError = true;
        }
        else if(data.responsecode == 8) {
          // User does not exist
          $scope.showUserNotFoundError = true;
        }
        else {
          // Unknown error
          $scope.showUnknownError = true;
        }
        $("#ErrorModal").modal();
      }
      else {
        // Login successful
        phpInit($rootScope, $scope, $http);
        $location.path("dashboard");
      }
    });
  }
  
  $scope.showPasswordRecover = function() {
    $location.path("passwordrecover");
    $("#ErrorModal").modal('hide');
  };
  
  $scope.logout = function() {
    $http.post("api.php?q=logout").success(function(data){
      console.log(data);
      phpInit($rootScope, $scope, $http);
      $scope.loginEmail = "";
      $scope.loginPassword = "";
      $location.path("welcome");
    });
  }
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

function PasswordRecoverCtrl($scope, $http, $location, $routeParams) {
  if($routeParams.key == null) {
    $scope.showParForm = true;
  }
  else {
    // User is clicking on a link from email
    $http.get("api.php?q=check_key", {params:{key:$routeParams.key}})
        .success(function(data) {
      console.log(data);
      if(data.responsestring == "ERROR") {
        $scope.showBadKeyMsg = true;
      }
      else if(data.responsestring == "OK") {
        $scope.showNepForm = true;
        $scope.$parent.hideLoginForm = true;
        actEmail = data.email;
        if(data.fname != null && data.lname != null) {
          $scope.nameKnown = true;
          $scope.nepFname = data.fname;
          $scope.nepLname = data.lname;
        }
        else {
          $(".nep-name").prop("required", true);
        }
      }
    });
  }
  
  $scope.submitParForm = function() {
    $scope.disableParForm = true;
    $http.post("api.php?q=passwordrecover", {
      email:$scope.parEmail
    }).success(function(data) {
      console.log(data);
      if(data.responsestring == "ERROR") {
        if(data.responsecode == 8) {
          $scope.disableParForm = false;
          $scope.$parent.showUserNotFoundError = true;
          $("#ErrorModal").modal();
        }
      }
      else {
        $scope.showParForm = false;
        $scope.showCheckEmailMsg = true;
      }
    });
  }
  
  $scope.submitNepForm = function() {
    $scope.disableNepForm = true;
    console.log($scope.nepFname + " " + $scope.nepLname);
    
    $http.post("api.php?q=passwordchange", {
      key:$routeParams.key,
      newpassword:$scope.nepPassword1,
      fname:$scope.nepFname,
      lname:$scope.nepLname
    }).success(function(data) {
      if(data.responsestring == "ERROR") {
        if(data.responsecode == 4) {
          $scope.$parent.showUnknownError = true;
          $("#ErrorModal").modal();
        }
      }
      else {
        $scope.showNepForm = false;
        $scope.showSuccessMsg = true;
        $scope.$parent.hideLoginForm = false;
      }
    });
  }
  
  $scope.showPasswordRecover = function() {
    $location.path("passwordrecover");
  };
}

function DashboardCtrl($scope, $http) {
}

// If you're not minifying, you can replace the array literal with just the 
// function name.
app.controller(
  "IndexCtrl", 
  ["$rootScope", "$scope", "$http", "$location", IndexCtrl]
);
app.controller(
  "WelcomeCtrl", 
  ["$scope", "$http", "$location", WelcomeCtrl]
);
app.controller(
  "ActivateCtrl", 
  ["$scope", "$http", "$routeParams", ActivateCtrl]
);
app.controller(
  "PasswordRecoverCtrl",
  ["$scope", "$http", "$location", "$routeParams", PasswordRecoverCtrl]
);
app.controller(
  "DashboardCtrl", 
  ["$scope", "$http", DashboardCtrl]
);