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