var app = angular.module('orange', ['ngRoute']);

function appConfig($routeProvider) {  
  $routeProvider.
    when('/', {
      templateUrl: (
        $.cookie("loggedIn") ? 
        'partials/dashboard.html' : 
        'partials/welcome.html'
      ),
      controller: (
        $.cookie("loggedIn") ? 
        'DashboardCtrl' : 
        'WelcomeCtrl'
      )
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
    when('/admin', {
      templateUrl: 'partials/admin.html',
      controller: 'AdminCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}

function phpInit($rootScope, $scope, $http) {
  $http.get("api.php?q=init").success(function(data) {
    console.log(data);
    $scope.projectname = data.projectname;
    $rootScope.initData = data;
    
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
    $http.post("api.php?q=login", phpObj).success(function(data) {
      console.log(data);
      if(data.responseString == "ERROR") {
        
        // Reset modal
        $scope.showNonActivateError = false;
        $scope.showWrongPasswordError = false;
        $scope.showUserNotFoundError = false;
        $scope.showUnknownError = false;
        
        if(data.responseCode == 6) {
          // Account not activated
          $scope.showNonActivateError = true;
        }
        else if(data.responseCode == 7) {
          // Wrong password
          $scope.showWrongPasswordError = true;
        }
        else if(data.responseCode == 8) {
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
    $http.post("api.php?q=logout").success(function(data) {
      console.log(data);
      phpInit($rootScope, $scope, $http);
      $scope.loginEmail = "";
      $scope.loginPassword = "";
      $location.path("");
    });
  }
}

function WelcomeCtrl($scope, $http, $location) {
  $scope.submitRegisterForm = function () {
    $scope.$parent.showPassword8Error = false;
    $scope.$parent.showPasswordMatchError = false;
    $scope.$parent.showEmailAlreadyError = false;
    $scope.$parent.showRecaptchaError = false;
    $scope.$parent.showUnknownError = false;
    
    if(typeof($scope.password1) === "undefined" || $scope.password1.length < 8) {
      $scope.$parent.showPassword8Error = true;
      $("#ErrorModal").modal();
    }
    else if($scope.password1 !== $scope.password2) {
      $scope.$parent.showPasswordMatchError = true;
      $("#ErrorModal").modal();
    }

    else {
      // Send a register API request
      $scope.disableRegForm = true;

      phpObj = {
        email:$scope.regEmail,
        password:$scope.password1,
        recaptchaResponse:grecaptcha.getResponse()
      };

      $http.post("api.php?q=register", phpObj).success(function(data) {
        console.log(data);

        if(data.responseString === "OK") {
          $location.path('emailsent');
        }
        else {
          // there was an error


          if(data.responseCode === 2)
            $scope.$parent.showEmailAlreadyError = true;

          else if(data.responseCode === 5)
            $scope.$parent.showRecaptchaError = true;

          else
            $scope.$parent.showUnknownError = true;

          $("#ErrorModal").modal();
          $scope.disableRegForm = false;
        }
      });
    }
  };
  
  $scope.phSup = placeholderSupported;
}

function ActivateCtrl($scope, $http, $routeParams) {
  $http.get("api.php?q=check_key", {params:{key:$routeParams.key}})
      .success(function(data) {
    console.log(data);
    if(data.responseString == "ERROR") {
      $scope.showBadKeyMsg = true;
    }
    else if(data.responseString == "OK") {
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
      if(data.responseString == "ERROR") {
        $scope.showBadKeyMsg = true;
      }
      else if(data.responseString == "OK") {
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
      if(data.responseString == "ERROR") {
        if(data.responseCode == 8) {
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
      newPassword:$scope.nepPassword1,
      fname:$scope.nepFname,
      lname:$scope.nepLname
    }).success(function(data) {
      if(data.responseString == "ERROR") {
        if(data.responseCode == 4) {
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

function DashboardCtrl($rootScope, $scope, $http, $location) {  
  $scope.$watch(
    function() {
      return $rootScope.initData;
    },
    function() {
      // This function might get called before initData exists, so make sure it
      // exists before calling stuff on it.
      if($rootScope.initData) {
        console.log("initData has now arrived from the server.");
        
        $scope.projectname = $rootScope.initData.projectname;
        
        // This just makes the code shorter.
        var d = $rootScope.initData;
        
        if(d.chalCurrent) {
          console.log("There is a current challenge.");
          if(d.team_id) {
            console.log("The user is on a team.");
            $scope.showDashboard = true;
          }
          else {
            console.log("The user is not on a team.");
            if(d.regOpen) {
              console.log("Registration is open.");
              $scope.showPickTeams = true;
            }
            else {
              console.log("Registration is closed.");
              $scope.showClosedMsg = true;
            }
          }
        }
        else {
          console.log("There is no current challenge.");
          if(d.regOpen) {
            console.log("Registration is open.");
            if(d.team_id) {
              console.log("The user is on a team.");
              $scope.showWaitMsg = true;
            }
            else {
              console.log("The user is not on a team.");
              $scope.showPickTeams = true;
            }
          }
          else {
            console.log("Registration is not open.");
            $scope.showClosedMsg = true;
          }
        }
      }
      else {
        console.log("initData has not arrived from the server yet.");
      }
    }
  );
  
  $scope.createButton = function() {
    $scope.showCreateForm = true;
    $scope.showJoinForm = false;
  }
  
  $scope.joinButton = function() {
    $scope.showJoinForm = true;
    $scope.showCreateForm = false;
  }
}

function AdminCtrl($scope, $http, $location) {
  var challengeObjs;
  
  var refreshChallenges = function() {
    $http.get("api.php?q=challenges").success(function(data) {
      console.log(data);
      
      $scope.challenges = data.challenges;
      $scope.showNcForm = false;

      challengeObjs = [];
      for(var key in $scope.challenges) {
        var c = $scope.challenges[key];
        
        challengeObjs.push(new Challenge(
          c.regStart,
          c.regEnd,
          c.start,
          c.end
        ));
      }
    });
  }
  
  refreshChallenges();
  
  $scope.submitNcForm = function() {
    var potentialChallenge = new Challenge(
      $scope.ncRegStart, 
      $scope.ncRegEnd, 
      $scope.ncStart, 
      $scope.ncEnd
    );
    var conflict = false;
    for(var c in challengeObjs) {
      if(potentialChallenge.datesOverlap(challengeObjs[c])) {
        conflict = true;
      }
    }
    
    if(conflict) {
      $scope.$parent.showUnknownError = true;
      $("#ErrorModal").modal();
    }
    else {
      $http.post("api.php?q=newchallenge", {
        regstart:$scope.ncRegStart,
        regend:$scope.ncRegEnd,
        start:$scope.ncStart,
        end:$scope.ncEnd
      }).success(function(data) {
        console.log(data);
        refreshChallenges();
      });
    }
  }
  
  $scope.deleteChallenge = function(id) {
    //TODO don't allow delete if participants are registered.
    $http.post("api.php?q=deletechallenge", {
      challengeid:id
    }).success(function(data) {
      console.log(data);
      refreshChallenges();
    });
  }
}

// If you're not minifying, you can replace the array literal with just the 
// function name.
app.config(["$routeProvider", appConfig]);
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
  ["$rootScope", "$scope", "$http", "$location", DashboardCtrl]
);
app.controller(
  "AdminCtrl",
  ["$scope", "$http", "$location", AdminCtrl]
);