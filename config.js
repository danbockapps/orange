var placeholderSupported =
    document.createElement("input").placeholder != undefined;

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
