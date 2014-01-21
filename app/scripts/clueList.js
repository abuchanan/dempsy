'use strict';

var mod = angular.module('dempsy.clueList', []);

mod.directive('clueList', function() {
  return {
    restrict: 'E',
    scope: {
      clues: '=',
      selected: '=',
      secondary: '=',
    },
    templateUrl: 'views/clue-list.html',
    link: function($scope) {

      $scope.listClasses = {
        secondary: $scope.secondary,
      };

      $scope.select = function(clue) {
        $scope.selected = clue;
      };

      $scope.cssClass = function(clue) {
        return {
          selected: clue === $scope.selected,
          complete: clue.isComplete(),
        }
      };

    }
  }
});
