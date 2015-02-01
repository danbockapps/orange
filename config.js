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
