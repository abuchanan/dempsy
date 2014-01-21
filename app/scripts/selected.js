'use strict';

var mod = angular.module('dempsy.selected', []);

mod.factory('Selected', function($rootScope) {

  function Selected() {

    var selected = {
      selectAndGuessDirection: selectAndGuessDirection,
    };

    function selectAndGuessDirection(cell) {
      selected.direction = false;
      selected.cell = cell;
    }

    function reset() {
      selected.cell = false;
      selected.direction = false;
      selected.clue = false;
    }

    reset();

    var $scope = $rootScope.$new(true);
    $scope.selected = selected;
    
    $scope.$watch('selected.cell', function(cell, oldCell) {
      if (cell === undefined) {
        return;
      }

      if (cell === false) {
        reset();
        return;
      }

      if (cell.isBlock) {
        selected.cell = oldCell;
        return;
      }

      if (!selected.direction) {
        if (!cell.startsAcross() && cell.startsDown()) {
          selected.direction = 'down';
        } else {
          selected.direction = 'across';
        }
      }

      selected.clue = selected.cell.clues[selected.direction];
    });

    $scope.$watch('selected.direction', function(direction) {
      if (direction) {
        selected.clue = selected.cell.clues[direction];
      } else {
      // TODO what should happen when things are set to false?
        //selected.clue = false;
      }
    });

    $scope.$watch('selected.clue', function(clue) {
      if (clue) {
        if (!clue.hasCell(selected.cell)) {
          $scope.$eval(function() {
            selected.cell = clue.cells[0];
          });
        }
        selected.direction = clue.direction;
      }
    });
    // TODO don't allow direction to be false

    return selected;
  }


  function bindMovements(selected) {

    function otherDirection(direction) {
      return direction == 'across' ? 'down' : 'across';
    }

    function flipDirection() {
      selected.direction = otherDirection(selected.direction);
    }

    function findNeighbor(_direction) {
      var current = selected.cell;

      while (true) {
        var next = current.neighbors[_direction];
        if (!next) return;
        if (next.isBlock) current = next;
        else return next;
      }
    }

    function previous() {
      if (selected.cell) {
        var d = selected.direction == 'across' ? 'left' : 'up';
        var prev = findNeighbor(d);

        if (prev) {
          selected.cell = prev;
        }
      }
    }

    function next() {
      if (selected.cell) {
        var d = selected.direction == 'across' ? 'right' : 'down';
        var next = findNeighbor(d);

        if (next) {
          selected.cell = next;
        }
      }
    }

    function Move(direction, callback) {
      return function() {
        if (selected.direction != direction) {
          flipDirection();
        } else {
          callback();
        }
      }
    }

    var left = Move('across', previous);
    var right = Move('across', next);
    var up = Move('down', previous);
    var down = Move('down', next);

    selected.flipDirection = flipDirection;
    selected.previous = previous;
    selected.next = next;
    selected.left = left;
    selected.right = right;
    selected.up = up;
    selected.down = down;
  }

  return {
    create: function() {
      var s = Selected();
      // TODO movements really belong outside of Selected
      bindMovements(s);
      return s;
    }
  }
});
