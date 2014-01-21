'use strict';

var mod = angular.module('dempsy.loading', []);

var fun = [
  'yup, still loading',
  'sigh',
  "how you doin'?",
  "how 'bout that weather, eh?",
  'burp',
  'sssoooooo',
  'awkward turtle',
  'any second now',
  'patience is a virtue',
];


mod.directive('loadingScreen', function($timeout) {
  return {
    scope: {},
    template: '<div>Loading{{ extra }}</div>',
    link: function($scope) {

      $scope.loading = true;

      $scope.$on('done-loading', function() {
        $scope.loading = false;
      });

      var ticks = 0;
      // TODO configurable
      var interval = 1000;
      $scope.extra = '';

      function tick() {
        ticks += 1;
        if (ticks % 5 == 0 && fun.length > 0) {
          var idx = Math.floor(Math.random() * fun.length);
          var item = fun.splice(idx, 1);
          $scope.extra += item;
        } else {
          $scope.extra += '.';
        }
        if ($scope.loading) {
          $timeout(tick, interval);
        }
      }
      tick();
    },
  }
});
