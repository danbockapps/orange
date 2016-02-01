(function() {
  angular.module('orange').factory('config', function($location) {
    var placeholderSupported =
      document.createElement("input").placeholder != undefined;

    function dateFormat(date8601) {
      var reportDate = Date.parse(date8601);
      var seconds = (new Date().getTime() - reportDate) / 1000;

      if(seconds < 60)
        return "Just now";
      else if(seconds < 3600) {
        var minutes = Math.round(seconds / 60);
        return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
      }
      else if(seconds < 3600 * 24) {
        var hours = Math.round(seconds / 3600);
        return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
      }
      else {
        // Naming thigs is hard
        reportDateDate = new Date(reportDate);
        return reportDateDate.getMonth() + 1 + "/" + reportDateDate.getDate();
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

    function setLoginVars(data, $rootScope, $scope) {
      $rootScope.initData = data;
      if(data.userid == null) {
        $scope.rightCorner = 'empty';
        $scope.loggedInFname = null;
        $scope.loggedInLname = null;
      }
      else {
        $scope.$parent.rightCorner = 'name';
        $scope.$parent.loggedInFname = data.fname;
        $scope.$parent.loggedInLname = data.lname;
      }
    }

    function phpInit($rootScope, $scope, $http, noRedirect) {
      // The conditional is so the API call doesn't happen twice when the app is
      // first loaded
      // Maybe the if should be one function and the else another?
      if(!initData.valid) {
        $http.get("api.php?q=init").success(function(data) {
          console.log(data);
          initData = data;

          // This doesn't do anything useful except on login and logout, but oh well
          setLoginVars(data, $rootScope, $scope);

          // pass null as the last arg to this function and there'll be no redirect
          if(!noRedirect) {
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

    return {
      placeholderSupported: placeholderSupported,
      dateFormat: dateFormat,
      processApiResponse: processApiResponse,
      phpInit: phpInit
    };
  });
})();