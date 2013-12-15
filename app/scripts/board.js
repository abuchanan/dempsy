'use strict';

var mod = angular.module('dempsy.board', []);


mod.service('Board', function(Cell, Clue) {

  this.build = function(size, blocks, clues) {
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


    // Transform raw clues (strings) into Clue instances.

    for (var i = 0, ii = clues.across.length; i < ii; i++) {
      clues.across[i] = Clue.create(clues.across[i], 'across');
    }

    for (var i = 0, ii = clues.down.length; i < ii; i++) {
      clues.down[i] = Clue.create(clues.down[i], 'down');
    }


    // Index the blocks by [row, col] for easy lookups. 
    var blocksIndex = {};

    for (var i = 0, ii = blocks.length; i < ii; i++) {
      var key = blocks[i];
      blocksIndex[key] = true;
    }


    var clueNumber = 0;
    var downIdx = -1;
    var acrossIdx = -1;

    var cells = [];

    for (var rowIdx = 0; rowIdx < size; rowIdx++) {

      var row = [];
      cells.push(row);

      for (var colIdx = 0; colIdx < size; colIdx++) {

        var key = [rowIdx, colIdx];
        var isBlock = blocksIndex[key]

        var cell = Cell.create();
        row.push(cell);

        if (!isBlock) {

          /* 
            These are cases where this cell starts a new "down" clue:

            - If this is the first row.
            - If the cell above this one is a "block".
          */
          var cellAboveKey = [rowIdx - 1, colIdx];
          var isDownStart = rowIdx == 0 || blocksIndex[cellAboveKey];


          /*
            These are cases where this cell starts a new "across" clue:

            - If this is the first column.
            - If the cell to the left is a "block".
          */
          var cellLeftKey = [rowIdx, colIdx - 1]
          var isAcrossStart = colIdx == 0 || blocksIndex[cellLeftKey];


          // Link cells together. This comes in useful in SelectedManager
          // when you want to select the next cell to the right, for example.
          if (rowIdx > 0) {
            cell.linkDown(cells[rowIdx - 1][colIdx]);
          }

          if (colIdx > 0) {
            cell.linkAcross(cells[rowIdx][colIdx - 1]);
          }


          // If this cell starts a new clue, increment the clue number,
          // increment the clue index number, set the clue's number
          // set the cell number, and link the clue to the cell.

          if (isDownStart || isAcrossStart) {
            clueNumber += 1;
            cell.number = clueNumber;
          }

          if (isDownStart) {
            downIdx += 1;
            var clue = clues.down[downIdx]
            clue.number = clueNumber;
            clue.start = cell;
            clue.cells.push(cell);
            cell.clues.down = clue;
          }

          if (isAcrossStart) {
            acrossIdx += 1;
            var clue = clues.across[acrossIdx]
            clue.number = clueNumber;
            clue.cells.push(cell);
            cell.clues.across = clue;
          }

          if (cell.prev.across && cell.prev.across.clues.across) {
            var prevAcross = cell.prev.across.clues.across;
            prevAcross.cells.push(cell);
            cell.clues.across = prevAcross;
          }

          if (cell.prev.down && cell.prev.down.clues.down) {
            var prevDown = cell.prev.down.clues.down;
            prevDown.cells.push(cell);
            cell.clues.down = prevDown;
          }
        }
      }
    }

    return {
      cells: cells,
      clues: clues,
    }
  };
});
