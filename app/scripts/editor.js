'use strict';

var mod = angular.module('dempsy.editor', []);

mod.service('Editor', function($document, $rootScope) {

  var scope = $rootScope.$new(true);

  // TODO this should be bound/unbound on selectedManager active/inactive events
  $document.keypress(function(event) {
    if (event.which != 0 && event.charCode != 0) {
      var c = String.fromCharCode(event.which);
      scope.$apply(function() {
        scope.$broadcast('update', c);
      });
    } else {
      // TODO make use of arrow, ESC, delete, and space keys
    }
  });

  return {
    on: function() {
      scope.$on.apply(scope, arguments);
    },
  };
});
