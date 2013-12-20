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

mod.directive('loading', function($timeout) {
  return {
    scope: {
      loading: '=',
    },
    template: '<div>Loading{{ extra }}</div>',
    link: function($scope) {
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

mod.controller('CrosswordCtrl', function ($scope, $routeParams, CrosswordData,
                                          CellSelector, Editor) {

  $scope.loading = true;

  var id = $routeParams.id;
  var crosswordPromise = CrosswordData.get(id);

  var cellSelector = $scope.select = CellSelector.create();

  crosswordPromise.then(function(game) {
    $scope.cells = game.board.cells;
    $scope.clues = game.board.clues;
    $scope.room = game.room;
    cellSelector.cell(game.board.cells[0][0]);
    $scope.loading = false;
  });


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
