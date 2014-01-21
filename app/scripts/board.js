'use strict';

var mod = angular.module('dempsy.board', [
  'dempsy.clue',
  'dempsy.cell',
]);


mod.service('ClueFactory', function(Clue) {

  this.create = function(across, down) {
    var acrossIdx = 0;
    var downIdx = 0;

    return {
      nextAcross: function(number) {
        var text = across[acrossIdx];
        acrossIdx += 1;
        return Clue.create(number, text, 'across');
      },
      nextDown: function(number) {
        var text = down[downIdx];
        downIdx += 1;
        return Clue.create(number, text, 'down');
      },
    }
  };
});


mod.service('Grid', function(Cell) {

  // TODO define "block"
  // TODO this wouldn't handle some unusual cases,
  //      such as having a row that was flanked above and below by blocks.
  //      e.g. (O's are cells, X's are blocks, Z is the cell in question
  //      OOOXOOO
  //      OOOZOOO
  //      OOOXOOO
  //      
  //      I believe this would try to assign a "down" clue to cell Z.
  //
  //      Also, anything non-square isn't supported. document this.


  function indexBlocks(blocks) {
    var index = {};

    for (var i = 0, ii = blocks.length; i < ii; i++) {
      var key = blocks[i];
      index[key] = true;
    }
    return index;
  }

  this.create = function(size, blocks) {

    var cells = [];
    var cellNumber = 1;
    blocks = indexBlocks(blocks);

    for (var rowIdx = 0; rowIdx < size; rowIdx++) {

      var row = [];
      cells.push(row);

      for (var colIdx = 0; colIdx < size; colIdx++) {

        var key = [rowIdx, colIdx];
        var cell = Cell.create(key);
        row.push(cell);

        // Link cells together. This comes in useful in SelectedManager
        // when you want to select the next cell to the right, for example.
        if (rowIdx > 0) {
          var neighbor = cells[rowIdx - 1][colIdx];
          cell.neighbors.up = neighbor;
          neighbor.neighbors.down = cell;
        }

        if (colIdx > 0) {
          var neighbor = cells[rowIdx][colIdx - 1];
          cell.neighbors.left = neighbor;
          neighbor.neighbors.right = cell;
        }

        cell.isBlock = blocks[key] !== undefined;

        if (cell.startsAcross() || cell.startsDown()) {
          cell.number = cellNumber;
          cellNumber += 1;
        }
      }
    }

    function forEachCell(callback) {
      for (var rowIdx = 0; rowIdx < size; rowIdx++) {
        for (var colIdx = 0; colIdx < size; colIdx++) {
          var cell = cells[rowIdx][colIdx];
          callback.call(cell, cell);
        }
      }
    }

    // Public API
    return {
      cells: cells,
      forEachCell: forEachCell,
    }
  };

});


mod.service('Board', function(ClueFactory) {

  this.create = function(grid, rawClues, content) {

    var clueFactory = ClueFactory.create(rawClues.across, rawClues.down);
    var clues = {
      across: [],
      down: [],
    };

    grid.forEachCell(function(cell) {

      var cellContent = content[cell.key];
      if (cellContent !== undefined) {
        cell.content = cellContent;
      }

      if (cell.startsAcross()) {
        var clue = clueFactory.nextAcross(cell.number);
        clues.across.push(clue);
        linkClueCells(cell, clue, 'across');
      }

      if (cell.startsDown()) {
        var clue = clueFactory.nextDown(cell.number);
        clues.down.push(clue);
        linkClueCells(cell, clue, 'down');
      }
    });

    return {
      grid: grid,
      clues: clues,
    }
  };

  function linkClueCells(cell, clue, direction) {
    clue.cells.push(cell);
    cell.clues[direction] = clue;

    var neighborDirection = direction == 'across' ? 'right' : 'down';
    var neighbor = cell.neighbors[neighborDirection];

    if (neighbor && !neighbor.isBlock) {
      linkClueCells(neighbor, clue, direction);
    }
  }
});
