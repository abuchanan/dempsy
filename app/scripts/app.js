'use strict';

var mod = angular.module('dempsy', [
  'ngRoute',
  'btford.socket-io',
  'dempsy.cell',
]);


mod.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});

mod.service('CrosswordData', function(socket, $q, Board) {
  this.get = function() {

    var deferred = $q.defer();

    socket.emit('load crossword', 'TODO', function(data) {

      var board = Board.build(data.board.size, data.board.blocks, data.board.clues);
      deferred.resolve(board);
      
    });
    return deferred.promise;
  };

  this.updateCell = function(row, col, content) {
    // TODO notice update failures
    var data = {
      row: row,
      col: col,
      content: content,
    };

    socket.emit('update cell', data);
  };
});


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


    this.position = function() {
      // TODO
      return {
        row: 0,
        col: 0,
        cell: selected.cell,
      }
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


mod.controller('MainCtrl', function ($scope, $document, CrosswordData, CellSelector) {

  /* TODO
   - somehow the crossword ID to be loaded must be defined. probably in $routeParams
   - loading screen
   - UI for starting a new crossword, or selecting from an existing instance.
   - lots of error handling
   - saving updates back to DB
   - synchronizing updates coming from another player
   - notify when other player is currently playing
   -- player sessions
   - multiple guesses
   */
  var crosswordPromise = CrosswordData.get();

  crosswordPromise.then(function(board) {
    $scope.cells = board.cells;
    $scope.clues = board.clues;
  });


  var cellSelector = $scope.select = CellSelector.create();


  // TODO this should be bound/unbound on selectedManager active/inactive events
  $document.keypress(function(event) {
    var position = cellSelector.position();

    if (position) {

      if (event.which != 0 && event.charCode != 0) {
        var c = String.fromCharCode(event.which);

        $scope.$apply(function() {
          position.cell.content = c;
          //CrosswordData.updateCell(position.row, position.col, position.cell.content);
          cellSelector.nextCell();
        });

      } else {
        // TODO make use of arrow, ESC, delete, and space keys
      }
    }
  });

});


mod.service('Clue', function() {

  this.create = function(text, direction) {
    return {
      text: text,
      number: direction,
      direction: direction,
      cells: [],
      _highlighted: false,

      cssClass: function() {
        var self = this;
        var d = {
          highlight: self._highlighted,
        }
        d[self.direction] = true;
        return d
      },

      isHighlighted: function() {
        return this._highlighted;
      },

      setHighlight: function(val) {
        val = Boolean(val);
        this._highlighted = val;
        var direction = this.direction;

        angular.forEach(this.cells, function(cell) {
          cell.highlight = val;
          cell.highlightDirection = direction;
        });
      },
    }
  };
});




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
