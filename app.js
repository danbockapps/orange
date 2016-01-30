var app = angular.module('orange');

function appConfig($routeProvider, routeProvider) {
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
    when('/fbunreg', {
      templateUrl: 'partials/fbunreg.html'
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
    when('/team/:id', {
      templateUrl: 'partials/team.html',
      controller: 'TeamCtrl'
    }).
    when('/team/', {
      templateUrl: 'partials/team.html',
      controller: 'TeamCtrl'
    }).
    when('/admin', {
      templateUrl: 'partials/admin.html',
      controller: 'AdminCtrl'
    }).
    when('/reports/:id', {
      templateUrl: 'partials/reports.html',
      controller: 'ReportsCtrl'
    }).
    when('/2016', {
      templateUrl: function() {
        if(userIsntLoggedIn()) {
          return routePath('welcome');
        }


        else if(userIsntOnTeam()) {
          if(registrationOpen()) {
            return routePath('selectTeam');
          }
          else {
            return routePath('regClosed');
          }
        }


        else if(challengeOpen()) {
          if(userHasntCompletedSurvey()) {
            return routePath('survey');
          }
          else {
            return routePath('logPoints');
          }

        }


        else {
          return routePath('challengeOver');
        }


      },
      controller: 'SwitchboardCtrl2016'
    }).
    otherwise({
      redirectTo: '/'
    });

  function routePath(file) {
    // Set the route for the Switchboard controller to use.
    // Otherwise it would have to do all the routing logic all over again!
    routeProvider.route = file;
    return 'partials/' + file + '.html';
  }

  function userIsntLoggedIn() {
    return !initData.userid;
  }

  function userIsntOnTeam() {
    return !initData.teamName;
  }

  function registrationOpen() {
    return initData.regOpen;
  }

  function challengeOpen() {
    return initData.chalCurrent;
  }

  function userHasntCompletedSurvey() {
    return !initData.surveyDone;
  }
}

function SwitchboardCtrl2016($rootScope, $scope, $http, $location, route) {
  var route = route.getRoute();
  console.log('route is ' + route);

  if(route === 'welcome') {
    welcomeSubCtrl($scope, $http, $location, config);
  }
  else if(route === 'selectTeam') {
    selectTeamSubCtrl($rootScope, $scope, $http, config);
  }
}

function IndexCtrl($rootScope, $scope, $http, $location, $route, config) {
  $scope.projectname = initData.projectname;
  config.phpInit($rootScope, $scope, $http, true);

  $scope.submitLoginForm = function(loginEmail, loginPassword) {
    phpObj = {email:loginEmail, password:loginPassword};
    $http.post("api.php?q=login", phpObj).success(function(data) {
      if(config.processApiResponse($scope, $scope, data)) {
        // Login successful
        initData.valid = false;
        config.phpInit($rootScope, $scope, $http);
      }
    });
  };

  $scope.showPasswordRecover = function() {
    $location.path("passwordrecover");
    $("#ErrorModal").modal('hide');
  };

  $scope.showWelcome = function() {
    $location.path('welcome');
  };

  $scope.logout = function() {
    $http.post("api.php?q=logout").success(function(data) {
      if(config.processApiResponse($scope, $scope, data)) {
        initData.valid = false;
        config.phpInit($rootScope, $scope, $http);
        $scope.loginEmail = "";
        $scope.loginPassword = "";
      }
    });
  };
}

function SwitchboardCtrl($rootScope, $scope, $http, $location, config) {
  if(initData.userid)
    dashboardSubCtrl($rootScope, $scope, $http, $location, config);
  else
    welcomeSubCtrl($scope, $http, $location, config);
}

function welcomeSubCtrl($scope, $http, $location, config) {
  $scope.submitRegisterForm = function() {
    $scope.disableRegForm = true;

    if($scope.regMethod === 'email') {
      phpObj = {
        email:$scope.regEmail,
        initials:$scope.initials,
        recaptchaResponse:grecaptcha.getResponse()
      };

      $http.post("api.php?q=register", phpObj).success(function(data) {
        if(config.processApiResponse($scope, $scope.$parent, data)) {
          $location.path('emailsent');
        }
        else {
          // there was an error
          $scope.disableRegForm = false;
        }
      });
    }
    else if($scope.regMethod === 'facebook') {
      $http.post('api.php?q=initials', {initials: $scope.initials})
      .success(function(data) {
        window.location.href = 'fb_init.php?registering=yes';
      })
    }
  };

  $scope.phSup = config.placeholderSupported;
}

function ActivateCtrl($rootScope, $scope, $http, $location, $routeParams, config) {
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
      if(config.processApiResponse($scope, $scope.$parent, data)) {
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
}

function selectTeamSubCtrl($rootScope, $scope, $http, config) {
  $scope.submitCreateForm = function() {
    $scope.hideJoinButton = true;
    $scope.disableCreateForm = true;
    $scope.hideCreateSubmit = true;
    $scope.showCreateSpinner = true;

    $http.post("api.php?q=newteam", {teamName: $scope.createTeamName})
    .success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.showCreateSpinner = false;
        $scope.showTeamCreated = true;
      }
    });
  }

  $scope.getStarted = function() {
    initData.valid = false;
    config.phpInit($rootScope, $scope, $http);
  }
}

function dashboardSubCtrl($rootScope, $scope, $http, $location, config) {
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
            if(d.goal) {
              console.log("The user has set a goal.");
              $scope.showDashboard = true;
              $http.get("api.php?q=activities").success(function(data) {
                if(config.processApiResponse($scope, $scope.$parent, data)) {
                  $scope.activities = data.activities;
                  $scope.reports = data.reports;
                }
              });
            }
            else {
              console.log("The user has not set a goal.");
              $scope.showGoal = true;
            }
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
      if(config.processApiResponse($scope, $scope.$parent, data)) {
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
      if(config.processApiResponse($scope, $scope.$parent, data)) {
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
    config.phpInit($rootScope, $scope, $http);
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
    $scope.disableAllButtons = true;
    $http.post("api.php?q=submitactivity", {activityId:activityId})
      .success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.reports = data.reports;
      }
      $scope.disableAllButtons = false;
    });
  }

  $scope.deleteReport = function(reportId) {
    $scope.disableAllButtons = true;
    $http.post("api.php?q=deletereport", {reportId:reportId})
      .success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.reports = data.reports;
      }
      $scope.disableAllButtons = false;
    });
  }

  $scope.showTeamButton = function() {
    $location.path("team");
  }

  // This is a function in config.js.
  $scope.dateFormat = config.dateFormat;

  $scope.submitGoalForm = function() {
    $http.post("api.php?q=setgoal", {
      goal:$scope.goalRadio,
      initials:$scope.initials
    }).success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.getStarted();
      }
    });
  }
}

function TeamCtrl($rootScope, $scope, $http, $location, $routeParams, config) {
  $http.get("api.php?q=team", {params:{teamId:$routeParams.id}})
    .success(function(data) {
    if(config.processApiResponse($scope, $scope.$parent, data)) {
      if(!data.loggedIn) {
        $rootScope.initData.valid = false;
        config.phpInit($rootScope, $scope.$parent, $http);
      }

      $scope.teamName = data.teamName;
      $scope.joinCode = data.joinCode;
      $scope.teamReports = data.teamReports;

      var challengeStart = Date.parse($rootScope.initData.challengeStart) / 1000;
      $scope.numWeeks = numWeeksSince(challengeStart);

      $scope.totals = {
        pointWeeks:
          Array.apply(null, Array($scope.numWeeks)).map(Number.prototype.valueOf, 0),
        total: 0,
        goal: 0
      };

      var indexedTeam = indexTeam(data.teamMembers);
      indexedTeam.forEach(function(teamMember) {
        // Initialize pointWeeks arrays with zeroes
        teamMember.pointWeeks =
          Array.apply(null, Array($scope.numWeeks)).map(Number.prototype.valueOf, 0);

        // Initialize total with zero too
        teamMember.total = 0;

        $scope.totals.goal += teamMember.goal;
      });

      $scope.teamReports.forEach(function(report) {
        var weekNum = numWeeksSince(challengeStart,
          Date.parse(report.reportdttm)/1000) - 1

        indexedTeam[report.userid].pointWeeks[weekNum] += report.pointvalue;
        indexedTeam[report.userid].total += report.pointvalue;
        $scope.totals.pointWeeks[weekNum] += report.pointvalue;
        $scope.totals.total += report.pointvalue;
      });

      $scope.teamMembers = deindexTeam(indexedTeam);
    }
  });

  $scope.getNumber = function(num) {
    return new Array(num);
  }

  function indexTeam(teamMembers) {
    var returnable = new Array();

    teamMembers.forEach(function(teamMember) {
      returnable[teamMember.userid] = teamMember;
    });

    return returnable;
  }

  function deindexTeam(teamMembers) {
    var returnable = new Array();
    var index = 0;

    teamMembers.forEach(function(teamMember) {
      returnable[index++] = teamMember;
    });

    return returnable;
  }

  function numWeeksSince(startSeconds, endSeconds) {
    if(arguments.length == 1)
      endSeconds = new Date().getTime() / 1000;

    var diffSeconds = endSeconds - startSeconds;
    var diffWeeks = diffSeconds / 604800;
    return Math.ceil(diffWeeks);
  }

  $scope.showDashboard = function() {
    $location.path("");
  }
}

function AdminCtrl($scope, $http, $location, config) {
  //TODO show only those participants who are registered in the current challenge
  $scope.predicate = 'dateuseradded';
  $scope.reverse = true;
  refreshChallenges();

  $http.get("api.php?q=participants").success(function(data) {
    if(config.processApiResponse($scope, $scope.$parent, data)) {
      $scope.participants = data.participants;
      for(i=0; i<$scope.participants.length; i++)
        if($scope.participants[i].teamname == null)
          $scope.participants[i].teamname = "";
    }
  });

  function refreshChallenges() {
    $http.get("api.php?q=challenge").success(function(data) {
      console.log(data);

      $scope.challenge = data.challenge;
      $scope.showNcForm = false;
    });
  }

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
        if(config.processApiResponse($scope, $scope.$parent, data)) {
          refreshChallenges();
        }
      });
    }
  }
}

function ReportsCtrl($scope, $http, $routeParams, config) {
  $scope.reportId = $routeParams.id;
  $http.get("api.php?q=report_" + $routeParams.id).success(function(data) {
    if(config.processApiResponse($scope, $scope.$parent, data)) {
      // This works for the current users report.
      // It will change if there's ever a second report.
      $scope.users = data.users;
    }
  });
}

// If you're not minifying, you can replace the array literal with just the
// function name.

// Also, if any of these is a provider, you have to add 'Provider' to the end
// of the dependency name.

app.config(["$routeProvider", 'routeProvider', appConfig]);
app.controller('SwitchboardCtrl2016', SwitchboardCtrl2016);
app.controller(
  "IndexCtrl",
  ["$rootScope", "$scope", "$http", "$location", "$route", 'config', IndexCtrl]
);
app.controller(
  "SwitchboardCtrl",
  ["$rootScope", "$scope", "$http", "$location", 'config', SwitchboardCtrl]
);
app.controller(
  "ActivateCtrl",
  ["$rootScope", "$scope", "$http", "$location", "$routeParams", 'config', ActivateCtrl]
);
app.controller(
  "TeamCtrl",
  ["$rootScope", "$scope", "$http", "$location", "$routeParams", 'config', TeamCtrl]
);
app.controller(
  "AdminCtrl",
  ["$scope", "$http", "$location", 'config', AdminCtrl]
);
app.controller(
  "ReportsCtrl",
  ["$scope", "$http", "$routeParams", 'config', ReportsCtrl]
);
