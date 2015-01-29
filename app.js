var app = angular.module('orange', ['ngRoute']);

function appConfig($routeProvider) {  
  $routeProvider.
    when('/', {
      templateUrl: function() {
        if(initData.userid)
          return 'partials/dashboard.html';
        else
          return 'partials/welcome.html';
      },
      controller: 'SwitchboardCtrl'
    }). 
    when('/emailsent', {
      templateUrl: 'partials/emailsent.html'
    }).
    when('/activate/:key', {
      templateUrl: 'partials/activate.html',
      controller: 'ActivateCtrl'
    }).
    when('/passwordrecover/', {
      templateUrl: 'partials/activate.html',
      controller: 'ActivateCtrl'
    }).
    when('/passwordrecover/:key', {
      templateUrl: 'partials/activate.html',
      controller: 'ActivateCtrl'
    }).
    when('/admin', {
      templateUrl: 'partials/admin.html',
      controller: 'AdminCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}

function phpInit($rootScope, $scope, $http, $location) {
  //TODO make this API call not happen twice when the app is first loaded
  $http.get("api.php?q=init").success(function(data) {
    console.log(data);
    $scope.projectname = data.projectname;
    $rootScope.initData = data;
    initData = data;
    
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
    
    // pass null as the last arg to this function and there'll be no redirect
    if($location != null) {
      // "?a=b" is to trick Angular into calling the function in
      // routeProvider when templateUrl.
      $location.path("?a=b");
    }
  });
}

function IndexCtrl($rootScope, $scope, $http, $location, $route) {
  phpInit($rootScope, $scope, $http);
  
  $scope.submitLoginForm = function() {
    phpObj = {email:$scope.loginEmail, password:$scope.loginPassword};
    $http.post("api.php?q=login", phpObj).success(function(data) {
      if(processApiResponse($scope, $scope, data)) {
        // Login successful
        phpInit($rootScope, $scope, $http, $location);
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
        phpInit($rootScope, $scope, $http, $location);
        $scope.loginEmail = "";
        $scope.loginPassword = "";
      }
    });
  }
}

function SwitchboardCtrl($rootScope, $scope, $http, $location) {
  if(initData.userid)
    dashboardSubCtrl($rootScope, $scope, $http, $location);
  else
    welcomeSubCtrl($scope, $http, $location);
}

function welcomeSubCtrl($scope, $http, $location) {
  $scope.submitRegisterForm = function () {
    // Send a register API request
    $scope.disableRegForm = true;

    phpObj = {
      email:$scope.regEmail,
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
  };
  
  $scope.phSup = placeholderSupported;
}

function ActivateCtrl($scope, $http, $routeParams) {
  if($routeParams.key == null) {
    // User is looking for login help. Ask for email address.
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
      else {
        $scope.showNepForm = true;
        if(data.fname != null && data.lname != null) {
          // Name and survey data are already in db
          $scope.nameKnown = true;
          $scope.header = "Reset your password";
        }
        else {
          $scope.header = "Complete your registration";
          
          // Name and survey data are not in db. Require them.
          $(".name-and-survey").prop("required", true);
        }
        $scope.$parent.hideLoginForm = true;
        actEmail = data.email;
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
      
      var phpObj = {};
      phpObj.email = actEmail;
      phpObj.key = $routeParams.key;
      phpObj.password = $scope.nepPassword1;
      if(!$scope.nameKnown) {
        phpObj.fname = $scope.nepFname;
        phpObj.lname = $scope.nepLname;
        phpObj.age = $scope.nepAge;
        phpObj.sex = $scope.nepSex;
        phpObj.heightinches = $scope.nepHeightinches;
        
        // TODO move these changing metrics to a separate survey page
        // for repeat participants
        phpObj.weight = $scope.nepWeight;
        phpObj.zip = $scope.nepZip;
        phpObj.activityLevel = $scope.nepActivityLevel;
        phpObj.exerciseMins = $scope.nepExerciseMins;
        phpObj.exerciseTypes = $scope.nepExerciseTypes;
        phpObj.fruits = $scope.nepFruits;
      }
      
      $http.post("api.php?q=activate", phpObj).success(function(data) {
        console.log(data);
        $scope.showNepForm = false;
        $scope.showCompleteMsg = true;
        $scope.$parent.hideLoginForm = false;
      });
    }
  };
  
  $scope.showPasswordRecover = function() {
    $location.path("passwordrecover");
  };
}

function dashboardSubCtrl($rootScope, $scope, $http, $location) {  
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
      $scope.showJoinSpinner = false;
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.teamName = data.teamName;
        $scope.showTeamJoined = true;
      }
      else {
        $scope.disableJoinForm = false;
        $scope.hideJoinSubmit = false;
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
    var r = confirm("WARNING! This creates a new challenge and locks out " +
        "participants from the old challenge.");
    if(r) {
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
}

// If you're not minifying, you can replace the array literal with just the 
// function name.
app.config(["$routeProvider", appConfig]);
app.controller(
  "IndexCtrl", 
  ["$rootScope", "$scope", "$http", "$location", "$route", IndexCtrl]
);
app.controller(
  "SwitchboardCtrl",
  ["$rootScope", "$scope", "$http", "$location", SwitchboardCtrl]
);
app.controller(
  "ActivateCtrl", 
  ["$scope", "$http", "$routeParams", ActivateCtrl]
);
app.controller(
  "AdminCtrl",
  ["$scope", "$http", "$location", AdminCtrl]
);
