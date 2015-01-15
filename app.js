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
      if(processApiResponse($scope, $scope, data)) {
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
      if(processApiResponse($scope, $scope, data)) {
        phpInit($rootScope, $scope, $http);
        $scope.loginEmail = "";
        $scope.loginPassword = "";
        $location.path("");
      }
    });
  }
}

function WelcomeCtrl($scope, $http, $location) {
  $scope.submitRegisterForm = function () {
    
    if(typeof($scope.password1) === "undefined" || $scope.password1.length < 8) {
      $scope.$parent.modalMsg = 1;
      $("#ErrorModal").modal();
    }
    else if($scope.password1 !== $scope.password2) {
      $scope.$parent.modalMsg = 11;
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
        if(processApiResponse($scope, $scope.$parent, data)) {
          $location.path('emailsent');
        }
        else {
          // there was an error
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
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.showParForm = false;
        $scope.showCheckEmailMsg = true;
      }
      else {
        $scope.disableParForm = false;
      }
    });
  }
  
  $scope.submitNepForm = function() {
    if(typeof($scope.nepPassword1) === "undefined" || $scope.nepPassword1.length < 8) {
      $scope.$parent.modalMsg = 1;
      $("#ErrorModal").modal();
    }
    else if($scope.nepPassword1 !== $scope.nepPassword2) {
      $scope.$parent.modalMsg = 11;
      $("#ErrorModal").modal();
    }
    else {
      $scope.disableNepForm = true;
      $http.post("api.php?q=passwordchange", {
        key:$routeParams.key,
        newPassword:$scope.nepPassword1,
        fname:$scope.nepFname,
        lname:$scope.nepLname
      }).success(function(data) {
        if(processApiResponse($scope, $scope.$parent, data)) {
          $scope.showNepForm = false;
          $scope.showSuccessMsg = true;
          $scope.$parent.hideLoginForm = false;
        }
      });
    }
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
        $scope.userEmail = $rootScope.initData.userEmail;
        
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
  
  $scope.submitCreateForm = function() {
    $scope.hideJoinButton = true;
    $scope.disableCreateForm = true;
    $scope.hideCreateSubmit = true;
    $scope.showCreateSpinner = true;
    
    $http.post("api.php?q=newteam", {teamName: $scope.createTeamName})
    .success(function(data) {
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.showCreateSpinner = false;
        $scope.joinCode = data.joinCode;
        $scope.showTeamCreated = true;
      }
    });
  }
  
  $scope.submitJoinForm = function() {
    $scope.hideCreateButton = true;
    $scope.disableJoinForm = true;
    $scope.hideJoinSubmit = true;
    $scope.showJoinSpinner = true;
    
    $http.post("api.php?q=jointeam", {joinCode: $scope.joinJoinCode})
    .success(function(data) {
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.showJoinSpinner = false;
        $scope.teamName = data.teamName;
        $scope.showTeamJoined = true;
      }
    });
  }
  
  $scope.getStarted = function() {
    $location.path("");
  }
}

function AdminCtrl($scope, $http, $location) {
  var refreshChallenges = function() {
    $http.get("api.php?q=challenge").success(function(data) {
      console.log(data);
      
      $scope.challenge = data.challenge;
      $scope.showNcForm = false;
    });
  }
  
  refreshChallenges();
  
  $scope.submitNcForm = function() {
    $http.post("api.php?q=changedates", {
      regstart:$scope.ncRegStart,
      regend:$scope.ncRegEnd,
      start:$scope.ncStart,
      end:$scope.ncEnd
    }).success(function(data) {
      if(processApiResponse($scope, $scope.$parent, data)) {
        refreshChallenges();
      }
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
