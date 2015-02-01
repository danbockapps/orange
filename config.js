var placeholderSupported =
    document.createElement("input").placeholder != undefined;

var initData;

appInit();

function appInit() {
  //TODO put a spinner or something on the page while this is loading
  $.get("api.php?q=init", function(data) {
    initData = $.parseJSON(data);
    initData.valid = true;
    console.log(initData);
    
    // Manually start Angular so it doesn't try to start before appInit
    angular.bootstrap(document, ['orange']);
  });
}

function setLoginVars(data, $scope) {
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
}

function phpInit($scope, $http, $location) {
  // The conditional is so the API call doesn't happen twice when the app is
  // first loaded
  if(!initData.valid) {
    $http.get("api.php?q=init").success(function(data) {
      console.log(data);
      initData = data;
      
      setLoginVars(data, $scope);
      
      // pass null as the last arg to this function and there'll be no redirect
      if($location != null) {
        // "?a=b" is to trick Angular into calling the function in
        // routeProvider/when/templateUrl.
        $location.path("?a=b");
      }
    });
  }
  else {
    setLoginVars(initData, $scope);
  }
}

function processApiResponse($scope, modalScope, data) {
  console.log(data);

  if(data.responseString == "ERROR") {
    modalScope.modalMsg = data.responseCode;
    $("#ErrorModal").modal();

    return false;
  }

  else {
    return true;
  }
}
