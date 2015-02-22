var placeholderSupported =
    document.createElement("input").placeholder != undefined;

var initData;

appInit();

function appInit() {
  $.get("api.php?q=init", function(data) {
    initData = $.parseJSON(data);
    initData.valid = true;
    console.log(initData);
    
    // Manually start Angular so it doesn't try to start before appInit
    angular.bootstrap(document, ['orange']);
    $("body").css("display", "");
  });
}

function setLoginVars(data, $rootScope, $scope) {
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
}

function phpInit($rootScope, $scope, $http, $location) {
  // The conditional is so the API call doesn't happen twice when the app is
  // first loaded
  if(!initData.valid) {
    $http.get("api.php?q=init").success(function(data) {
      console.log(data);
      initData = data;
      
      setLoginVars(data, $rootScope, $scope);
      
      // pass null as the last arg to this function and there'll be no redirect
      if($location != null) {
        // "?a=b" is to trick Angular into calling the function in
        // routeProvider/when/templateUrl.
        $location.path("?a=b");
      }
    });
  }
  else {
    setLoginVars(initData, $rootScope, $scope);
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

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    console.log("Token is " + response.authResponse.accessToken);
    testAPI();
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '290860174339771',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.1' // use version 2.1
  });
  
  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.
  
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });
}
