(function() {
  angular.module('orange').factory('config', function() {
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
    
    return {
      dateFormat: dateFormat
    };
  });
})();