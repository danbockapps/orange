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

function IndexCtrl($rootScope, $scope, $http, $location, $route) {
  $scope.projectname = initData.projectname;
  phpInit($rootScope, $scope, $http);

  $scope.submitLoginForm = function() {
    phpObj = {email:$scope.loginEmail, password:$scope.loginPassword};
    $http.post("api.php?q=login", phpObj).success(function(data) {
      if(processApiResponse($scope, $scope, data)) {
        // Login successful
        initData.valid = false;
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
        initData.valid = false;
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

function ActivateCtrl($rootScope, $scope, $http, $location, $routeParams) {
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
        $scope.activated = data.activated;
        $scope.fbid = data.fbid;

        console.log("fbid and activated: ");
        console.log($scope.fbid);
        console.log($scope.activated);

        if(data.activated) {
          $scope.header = "Reset your password";
          $(".password").prop("required", true);
          console.log("only password is required");
        }
        else {
          $scope.header = "Complete your registration";
          $(".survey").prop("required", true);
          console.log("survey is required");
          if(!data.fbid) {
            $(".name").prop("required", true);
            $(".password").prop("required", true);
            console.log("name and password are required.");
          }
        }

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
    var error = false;
    if($scope.activated || !$scope.fbid) {
      // User is choosing a password.
      if(typeof($scope.nepPassword1) === "undefined" || $scope.nepPassword1.length < 8) {
        $scope.$parent.modalMsg = 1;
        error = true;
        $("#ErrorModal").modal();
      }
      else if($scope.nepPassword1 !== $scope.nepPassword2) {
        $scope.$parent.modalMsg = 11;
        error = true;
        $("#ErrorModal").modal();
      }
    }
    if(!error) {
      $scope.disableNepForm = true;

      var allFields = {};
      var phpObj = {};

      allFields.email = actEmail;
      allFields.key = $routeParams.key;
      allFields.password = $scope.nepPassword1;
      allFields.fname = $scope.nepFname;
      allFields.lname = $scope.nepLname;
      allFields.age = $scope.nepAge;
      allFields.sex = $scope.nepSex;
      allFields.heightinches = $scope.nepHeightinches;

      // TODO move these changing metrics to a separate survey page
      // for repeat participants
      allFields.weight = $scope.nepWeight;
      allFields.zip = $scope.nepZip;
      allFields.activityLevel = $scope.nepActivityLevel;
      allFields.exerciseMins = $scope.nepExerciseMins;
      allFields.exerciseTypes = $scope.nepExerciseTypes;
      allFields.fruits = $scope.nepFruits;

      for(var i in allFields) {
        if(typeof(allFields[i]) !== "undefined")
          phpObj[i] = allFields[i];
      }

      console.dir(allFields);
      console.dir(phpObj);


      $http.post("api.php?q=activate", phpObj).success(function(data) {
        console.log(data);

        if($scope.fbid) {
          window.location.replace("fb_init.php");
        }
        else {
          $scope.showNepForm = false;
          $scope.showCompleteMsg = true;
        }
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
        $scope.teamName = $rootScope.initData.teamName;

        // This just makes the code shorter.
        var d = $rootScope.initData;

        if(d.chalCurrent) {
          console.log("There is a current challenge.");
          if(d.teamName) {
            console.log("The user is on a team.");
            $scope.showDashboard = true;
            $http.get("api.php?q=activities").success(function(data) {
              if(processApiResponse($scope, $scope.$parent, data)) {
                $scope.activities = data.activities;
                $scope.reports = data.reports;
              }
            });
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
            if(d.teamName) {
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
    initData.valid = false;
    phpInit($rootScope, $scope, $http, $location);
  }
  
  $scope.btnColor = function(pointValue) {
    if(pointValue > 2)
      // Orange buttons for five-point activities
      return "btn-warning";
    else if(pointValue >= 2)
      // Blue buttons for two-point activities
      return "btn-primary";
    else
      // Light blue buttons for one-point activities
      return "btn-info";
  }

  $scope.submitActivity = function(activityId) {
    $http.post("api.php?q=submitactivity", {activityId:activityId})
      .success(function(data) {
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.reports = data.reports;
      }
    });
  }
  
  $scope.deleteReport = function(reportId) {
    $http.post("api.php?q=deletereport", {reportId:reportId})
      .success(function(data) {
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.reports = data.reports;
      }
    });
  }
  
  $scope.showTeamButton = function() {
    //TODO make this its own partial
    $scope.showDashboard = false;
    $scope.showTeam = true;
    $http.get("api.php?q=team").success(function(data) {
      if(processApiResponse($scope, $scope.$parent, data)) {
        $scope.team = data.team;
      }
    });
  }
  
  // This is a function in config.js.
  $scope.dateFormat = dateFormat;
}

function AdminCtrl($scope, $http, $location) {
  //TODO show only those participants who are registered in the current challenge
  $scope.predicate = 'dateuseradded';
  $scope.reverse = true;

  $http.get("api.php?q=participants").success(function(data) {
    if(processApiResponse($scope, $scope.$parent, data)) {
      $scope.participants = data.participants;
      for(i=0; i<$scope.participants.length; i++)
        if($scope.participants[i].teamname == null)
          $scope.participants[i].teamname = "";
    }
  });

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
  ["$rootScope", "$scope", "$http", "$location", "$routeParams", ActivateCtrl]
);
app.controller(
  "AdminCtrl",
  ["$scope", "$http", "$location", AdminCtrl]
);
