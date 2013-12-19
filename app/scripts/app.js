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
    // TODO shouldn't have to check if (cell)
    //      if we're getting this event, a cell should be selected.
    if (cell) {
      cell.content(c);
      cellSelector.nextCell();
    }
  });

  Editor.on('left', function() {
    cellSelector.setDirection('across');
    cellSelector.prevCell();
  });

  Editor.on('right', function() {
    cellSelector.setDirection('across');
    cellSelector.nextCell();
  });

  Editor.on('up', function() {
    cellSelector.setDirection('down');
    cellSelector.prevCell();
  });

  Editor.on('down', function() {
    cellSelector.setDirection('down');
    cellSelector.nextCell();
  });

  Editor.on('backspace', function() {
    var cell = cellSelector.current();
    if (cell) {
      cell.content('');
      cellSelector.prevCell();
    }
  });

});
