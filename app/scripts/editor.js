'use strict';

var mod = angular.module('dempsy.editor', []);


mod.service('Editor', function($document, $rootScope) {

  var scope = $rootScope.$new(true);

  function modified() {
    console.log(altModified, ctrlModified, metaModified, shiftModified);
    return altModified || ctrlModified || metaModified || shiftModified;
  }

  var map = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    8: 'backspace',
  }

  $document.keydown(function(event) {
    var code = map[event.keyCode];
    if (code) {
      scope.$apply(function() {
        event.preventDefault();
        scope.$broadcast(code);
      });
    }
  });

  // TODO this should be bound/unbound on selectedManager active/inactive events
  $document.keypress(function(event) {

    // If the user is holding a modifier key (ctrl, shift, etc)
    // don't accept character input.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

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
