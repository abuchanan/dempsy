'use strict';

var mod = angular.module('dempsy', [
  'ngRoute',
  'dempsy.data',
  'dempsy.selected',
  'dempsy.loading',
  'dempsy.clueList',
  'dempsy.board',
  'dempsy.keybindings',
  'dempsy.builder',
]);


mod.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/crossword/:id', {
      templateUrl: 'views/crossword.html',
      controller: 'CrosswordCtrl',
    })
    .otherwise({
      redirectTo: '/'
    });
});


mod.controller('MainCtrl', function($scope, CrosswordData) {
  CrosswordData.list().then(function(data) {
    $scope.games = data;
  });
   // TODO UI for starting a new crossword, or selecting from an existing instance.
});


mod.controller('CrosswordCtrl', function ($scope, $routeParams, CrosswordData,
                                          Selected, KeyBindings) {

  $scope.selected = Selected.create();

  CrosswordData.get($routeParams.id)
    .then(function(game) {
      $scope.cells = game.board.grid.cells;
      $scope.clues = game.board.clues;
      $scope.room = game.room;

      $scope.selected.cell = game.board.grid.cells[0][0];

      //$scope.broadcast('done-loading');
    });


  $scope.cellClasses = function(cell) {
    return {
      selected: cell === $scope.selected.cell,
      highlight: $scope.selected.clue && $scope.selected.clue.hasCell(cell),
      block: cell.isBlock,
    }
  };

  $scope.select = function(cell) {
    if (cell === $scope.selected.cell) {
      $scope.selected.flipDirection();
    } else {
      $scope.selected.selectAndGuessDirection(cell);
    }
  };

  KeyBindings.on('left', $scope.selected.left);
  KeyBindings.on('right', $scope.selected.right);
  KeyBindings.on('up', $scope.selected.up);
  KeyBindings.on('down', $scope.selected.down);

  KeyBindings.on('character', function(event, c) {
    $scope.selected.cell.content = c;
    $scope.selected.next();
  });
  // TODO have spacebar change direction


  KeyBindings.on('backspace', function() {
    $scope.selected.cell.content= '';
    $scope.selected.previous();
  });

});
