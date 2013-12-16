'use strict';

var mod = angular.module('dempsy.cellselector', []);

mod.factory('CellSelector', function() {

  function Selector() {

    var selected = {
      cell: false,
      clues: {
        across: false,
        down: false,
      }
    };

    var direction;

    function _clearCell() {
        if (selected.cell) {
          selected.cell.selected = false;
        }
        selected.cell = false;
    }

    function _clearClues() {
      var across = selected.clues.across;
      selected.clues.across = false;

      if (across) {
        across.setHighlight(false);
      }

      var down = selected.clues.down;
      selected.clues.down = false;

      if (down) {
        down.setHighlight(false);
      }
    }


    function _clue(clue) {
      selected.clues[clue.direction] = clue;
      clue.setHighlight(true);
    }


    function toggleDirection() {
      if (direction == 'across') {
        direction = 'down';
      } else {
        direction = 'across';
      }
    }

    
    this.cell = function(cell, specificDirection) {

      if (cell.isBlock()) {
        return;
      }

      if (cell === selected.cell) {
        toggleDirection();
      } else {

        _clearCell();
        _clearClues();
        direction = specificDirection || 'across';

        selected.cell = cell;
        cell.selected = true;

        if (cell.clues.across) {
          _clue(cell.clues.across);
        }

        if (cell.clues.down) {
          _clue(cell.clues.down);
        }
      }
    };


    this.clue = function(clue) {
      this.cell(clue.cells[0], clue.direction);
    };


    this.current = function() {
      return selected.cell;
    };

    this.directionClass = function() {
      if (direction) {
        return direction + '-selected';
      }
      return '';
    };

    this.nextCell = function() {
      var current = selected.cell;
      if (current) {
        var next = current.next[direction];
        if (next) {
          this.cell(next, direction);
        }
      }
    };
  }

  return {
    create: function(cells) {
      return new Selector(cells);
    }
  }
});
