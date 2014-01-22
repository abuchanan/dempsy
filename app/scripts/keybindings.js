'use strict';

var mod = angular.module('dempsy.keybindings', []);

mod.service('KeyBindings', function($document, $rootScope) {

  var scope = $rootScope.$new(true);

  var map = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    8: 'backspace',
  }

  $document.keydown(function(event) {
    if (API.enabled) {
      var code = map[event.keyCode];
      if (code) {
        scope.$apply(function() {
          event.preventDefault();
          scope.$broadcast(code);
        });
      }
    }
  });

  $document.keypress(function(event) {

    if (API.enabled) {
      // If the user is holding a modifier key (ctrl, shift, etc)
      // don't accept character input.
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.which != 0 && event.charCode != 0) {
        var c = String.fromCharCode(event.which);
        scope.$apply(function() {
          scope.$broadcast('character', c);
        });
      }
    }
  });

  // Public API
  var API = {
    enabled: true,
    on: function() {
      scope.$on.apply(scope, arguments);
    },
  };

  return API;
});
