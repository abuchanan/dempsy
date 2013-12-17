'use strict';

var mod = angular.module('dempsy', [
  'ngRoute',
  'btford.socket-io',
  'dempsy.cell',
  'dempsy.data',
  'dempsy.cellselector',
  'dempsy.clue',
  'dempsy.board',
  'dempsy.editor',
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


mod.controller('MainCtrl', function($scope) {
   // TODO UI for starting a new crossword, or selecting from an existing instance.
});

mod.controller('CrosswordCtrl', function ($scope, $routeParams, CrosswordData,
                                          CellSelector, Editor) {

  /* TODO
   - loading screen
   - lots of error handling
   - synchronizing updates coming from another player
   - notify when other player is currently playing
   -- player sessions
   - multiple guesses
   */
  var id = $routeParams.id;
  var crosswordPromise = CrosswordData.get(id);

  var board;

  crosswordPromise.then(function(_board) {
    board = _board;
    $scope.cells = board.cells;
    $scope.clues = board.clues;
  });

  var cellSelector = $scope.select = CellSelector.create();

  Editor.on('update', function(event, c) {
    var cell = cellSelector.current();
    if (cell) {
      cell.content(c);
      cellSelector.nextCell();
    }
  });
});
