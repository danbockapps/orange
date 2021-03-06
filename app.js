(function() {
var app = angular.module('orange');

function appConfig($routeProvider, routeProvider) {
  $routeProvider.
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
    when('/', {
      templateUrl: function() {
        // Is there a simpler way to write out this logic? I don't know.

        if(userIsntLoggedIn()) {
          return routePath('welcome');
        }


        else if(userIsntOnTeam()) {
          if(registrationOpen()) {
            return routePath('selectTeam');
          }
          else {
            return routePath('challengeClosed');
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


        else if(registrationOpen() && userHasntCompletedSurvey()) {
          return routePath('survey');
        }
        else {
          return routePath('challengeClosed');
        }


      },
      controller: 'SwitchboardCtrl'
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

function SwitchboardCtrl($rootScope, $scope, $http, $location, route, config) {
  var route = route.getRoute();

  if(route === 'welcome') {
    welcomeSubCtrl($rootScope, $scope, $http, $location, config);
  }
  else if(route === 'selectTeam') {
    selectTeamSubCtrl($rootScope, $scope, $http, config);
  }
  else if(route === 'challengeClosed') {
    // No subcontroller necessary
  }
  else if(route === 'survey') {
    surveySubCtrl($rootScope, $scope, $http, config);
  }
  else if(route === 'logPoints') {
    logPointsSubCtrl($scope, $http, $location, config);
  }
}

function IndexCtrl($rootScope, $scope, $http, $location, $route, config) {
  $scope.projectname = initData.projectname;
  config.phpInit($rootScope, $scope, $http, true);

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
      }
    });
  };
}

function welcomeSubCtrl($rootScope, $scope, $http, $location, config) {
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

  $scope.submitLoginForm = function(loginEmail, loginPassword) {
    $scope.disableLoginForm = true;
    phpObj = {email:loginEmail, password:loginPassword};
    $http.post("api.php?q=login", phpObj).success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        // Login successful
        initData.valid = false;
        config.phpInit($rootScope, $scope, $http);
      }
      else {
        $scope.disableLoginForm = false;
      }
    });
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

      for(var i in allFields) {
        if(typeof(allFields[i]) !== "undefined")
          phpObj[i] = allFields[i];
      }

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
  // Initialize this so the join button doesn't flash on screen
  // when there are no teams.
  $scope.teams = [];

  $http.get('api.php?q=teams').success(function(data){
    $scope.teams = data.teams;
  });

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
  };

  $scope.submitJoinForm = function() {
    $scope.hideCreateButton = true;
    $scope.disableJoinForm = true;
    $scope.hideJoinSubmit = true;
    $scope.showJoinSpinner = true;

    $http.post("api.php?q=jointeam", {teamToJoin: $scope.teamToJoin})
    .success(function(data) {
      $scope.showJoinSpinner = false;
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.showTeamJoined = true;
      }
      else {
        $scope.hideCreateButton = false;
        $scope.disableJoinForm = false;
        $scope.hideJoinSubmit = false;
      }
    });
  };

  $scope.getStarted = function() {
    // Reload. Routing will take the user to survey.
    initData.valid = false;
    config.phpInit($rootScope, $scope, $http);
  };
}

function surveySubCtrl($rootScope, $scope, $http, config) {
  $scope.submitNepForm = function() {
    $scope.disableNepForm = true;

    var allFields = {};
    var phpObj = {};

    allFields.age = $scope.nepAge;
    allFields.sex = $scope.nepSex;
    allFields.heightinches = $scope.nepHeightinches;
    allFields.weight = $scope.nepWeight;
    allFields.zip = $scope.nepZip;
    allFields.activityLevel = $scope.nepActivityLevel;
    allFields.exerciseMins = $scope.nepExerciseMins;
    allFields.exerciseTypes = $scope.nepExerciseTypes;
    allFields.fruits = $scope.nepFruits;
    allFields.goal = $scope.goalRadio;

    for(var i in allFields) {
      if(typeof(allFields[i]) !== "undefined") {
        phpObj[i] = allFields[i];
      }
    }

    $http.post("api.php?q=submitSurvey", phpObj).success(function(data) {
      console.log(data);
      // Reload. Routing will take the user to logPoints.
      initData.valid = false;
      config.phpInit($rootScope, $scope, $http);
    });
  };
}

function logPointsSubCtrl($scope, $http, $location, config) {
  $scope.teamName = initData.teamName;

  $http.get("api.php?q=activities").success(function(data) {
    if(config.processApiResponse($scope, $scope.$parent, data)) {
      $scope.activities = data.activities;
      $scope.reports = data.reports;
    }
  });

  $scope.showTeamButton = function() {
    $location.path('team');
  };

  $scope.btnColor = function(pointValue) {
    if(pointValue > 2)
      // Blue buttons for five-point activities
      return 'btn-primary';
    else if(pointValue >= 0)
      // Orange buttons for one-point activities
      return 'btn-warning';
    else
      // Red buttons for negative-one-point activities
      return 'btn-danger';
  };

  $scope.submitActivity = function(activityId) {
    $scope.disableAllButtons = true;
    $http.post("api.php?q=submitactivity", {activityId:activityId})
      .success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.reports = data.reports;
      }
      $scope.disableAllButtons = false;
    });
  };

  $scope.deleteReport = function(reportId) {
    $scope.disableAllButtons = true;
    $http.post("api.php?q=deletereport", {reportId:reportId})
      .success(function(data) {
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.reports = data.reports;
      }
      $scope.disableAllButtons = false;
    });
  };

  $scope.showTeamButton = function() {
    $location.path("team");
  };

  $scope.dateFormat = config.dateFormat;
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
      $scope.numWeeks = Math.max(0, numWeeksSince(challengeStart));

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

  $http.get("api.php?q=participants").success(function(data) {
    if(config.processApiResponse($scope, $scope.$parent, data)) {
      $scope.participants = data.participants;
      for(i=0; i<$scope.participants.length; i++)
        if($scope.participants[i].teamname == null)
          $scope.participants[i].teamname = "";
    }
  });

  $http.get("api.php?q=teams").success(function(data) {
    console.log(data);
    $scope.teams = data.teams;
  });

  $scope.noTeam = function(element) {
    return !element.teamid;
  };

  $scope.yesTeam = function(element) {
    return element.teamid;
  }

  $scope.addToTeam = function() {
    $scope.disableAddForm = true;

    var phpObj = {
      userId: $scope.userToAdd,
      teamId: $scope.teamToAddTo
    }

    $http.post('api.php?q=addToTeam', phpObj).success(function(data) {
      $scope.disableAddForm = false;
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.participants = data.participants;
        resetForms();
      }
    })
  };

  $scope.removeFromTeam = function() {
    $scope.disableRemForm = true;

    var phpObj = {
      userId: $scope.userToRemove
    };

    $http.post('api.php?q=removeFromTeam', phpObj).success(function(data) {
      $scope.disableRemForm = false;
      if(config.processApiResponse($scope, $scope.$parent, data)) {
        $scope.participants = data.participants;
        $scope.teams = data.teams;
        resetForms();
      }
    });
  };

  function resetForms() {
    $scope.userToAdd = 0;
    $scope.teamToAddTo = 0;
    $scope.userToRemove = 0;
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
app.controller('SwitchboardCtrl', SwitchboardCtrl);
app.controller(
  "IndexCtrl",
  ["$rootScope", "$scope", "$http", "$location", "$route", 'config', IndexCtrl]
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
})();