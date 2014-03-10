'use strict';

var mod = angular.module('dempsy.builder', [
  'ngRoute',
  'btford.socket-io',
  'dempsy.data',
  'dempsy.board',
  'dempsy.keybindings',
]);


mod.config(function ($routeProvider) {
  $routeProvider
    .when('/crossword/builder', {
      templateUrl: 'views/builder.html',
      controller: 'BuilderCtrl',
    });
});


mod.controller('BuilderCtrl', function ($scope, Grid, socket) {

  var SIZE = 15;
  var grid;

  $scope.finish = function() {
    var across = $scope.rawAcross.split('\n');
    var down = $scope.rawDown.split('\n');

    var data = {
      size: SIZE,
      shape: 'square',
      blocks: getBlocks(),
      clues: {
        across: across,
        down: down,
      }
    };

    socket.emit('save board', data, function(result) {
      console.log(result);
    });
  }

  $scope.toggleBlock = function(cell) {
    cell.isBlock = !cell.isBlock;
    buildGrid();
  }

  $scope.cellClasses = function(cell) {
    return {
      //selected: cell === $scope.selected.cell,
      //highlight: $scope.selected.clue && $scope.selected.clue.hasCell(cell),
      block: cell.isBlock,
    }
  };

  function getBlocks() {
    var blocks = [];
    if (grid) {
      grid.forEachCell(function(cell) {
        if (cell.isBlock) {
          blocks.push(cell.key);
        }
      });
    }
    return blocks;
  }
  
  function buildGrid() {
    grid = Grid.create(SIZE, getBlocks());
    $scope.cells = grid.cells;
  }

  buildGrid();

});
