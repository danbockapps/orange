// This facilitates communication between the config function and the controllers.

(function() {
  angular.module('orange').provider('route', function() {
    this.$get = function() {
      var that = this;
      return {
        getRoute: function() {
          return that.route;
        }
      };
    }
  });
})();