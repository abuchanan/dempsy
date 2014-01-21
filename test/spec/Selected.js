describe('Selected', function() {
  var selected, board, cellA, blockCell, $rootScope;

  beforeEach(function() {

    module('dempsy.cell');
    module('dempsy.clue');

    module(function($provide) {

      $provide.decorator('Clue', jasmineToStringDecorator(function() {
        return 'Clue(' + this.text + ')';
      }));

      $provide.decorator('Cell', jasmineToStringDecorator(function() {
        return 'Cell(' + this.key + ')';
      }));
    });


    module('dempsy.selected');
    module('dempsy.board');

    inject(function(Selected, Grid, Board, _$rootScope_) {
        // TODO need to make a nice mock board to work with.
        //      or just use Grid and Board
        /*
          A 3x3 board for testing.
          Numbers indicate cells that start clues.
          Xs are empty cells.
          #s are blocks.

          123
          #4X
          5XX

          There are 3 across clues, and 4 down clues.
        */
        var size = 3;
        var blocks = [[1, 0]];
        var grid = Grid.create(3, blocks);
        var clueText = {
          across: ['1 across', '4 across', '5 across'],
          down: ['1 down', '2 down', '3 down', '5 down'],
        };
        var content = [];
        board = Board.create(grid, clueText, content);

        cellA = board.grid.cells[0][0];
        blockCell = board.grid.cells[1][0];

        selected = Selected.create();

        $rootScope = _$rootScope_;
        $rootScope.$digest()
    });
  });

  describe('defaults', function() {

    it('should have a defaults of false', function() {
      expect(selected.cell).toBe(false);
      expect(selected.direction).toBe(false);
      expect(selected.clue).toBe(false);
    });

  });

  describe('selected.cell', function() {

    it('can be set to false', function() {
      // Set it to something other than the default false
      selected.cell = cellA;
      $rootScope.$digest();

      selected.cell = false;
      $rootScope.$digest();
      expect(selected.cell).toBe(false);
      expect(selected.direction).toBe(false);
      expect(selected.clue).toBe(false);
    });

    it('is not set if the cell is a block (cell is previously false)', function() {
      selected.cell = blockCell;
      $rootScope.$digest();
      expect(selected.cell).toBe(false);
    });

    it('is not set if the cell is a block (cell is previously cellA)', function() {
      selected.cell = cellA;
      $rootScope.$digest();

      selected.cell = blockCell;
      $rootScope.$digest();
      expect(selected.cell).toBe(cellA);
    });

    it('sets the clue', function() {
      selected.cell = cellA;
      $rootScope.$digest();
      expect(selected.clue).toBe(board.clues.across[0]);

      selected.cell = board.grid.cells[1][1];
      $rootScope.$digest();
      expect(selected.clue).toBe(board.clues.across[1]);
    });

    it('should NOT watch for changes in cell, clue, etc. ' + 
       "(i.e. don't use $watch's objectEquality flag", function() {

      var spy = jasmine.createSpy('listenerSpy');
      var mockScope = $rootScope.$new(true);
      $watch = mockScope.$watch;
      mockScope.$watch = function(expr, func, objEq) {
        $watch.call(mockScope, expr, spy, objEq);
      };

      spyOn($rootScope, '$new').andReturn(mockScope);

      inject(function(Selected) {
        var selected = Selected.create();
        selected.cell = cellA;
        $rootScope.$digest();
        expect(spy).toHaveBeenCalled();

        spy.reset();

        selected.cell.id = 'foo';
        $rootScope.$digest();
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('sets the direction based on the cell.', function() {

      it('By default, the direction is set to "across"', function() {
        selected.cell = cellA;
        $rootScope.$digest();
        expect(selected.direction).toEqual('across');
      });

      it('A cell that begins a "down" clue but not an "across" clue ' +
         'will set the selected direction to "down"',
       function() {

        selected.cell = board.grid.cells[0][1];
        $rootScope.$digest();
        expect(selected.direction).toEqual('down');
        expect(selected.clue).toBe(board.clues.down[1]);
      });

      it("The direction is not changed if it's already set", function() {
        selected.cell = board.grid.cells[0][1];
        $rootScope.$digest();
        expect(selected.direction).toEqual('down');
        expect(selected.clue).toBe(board.clues.down[1]);

        selected.cell = cellA;
        $rootScope.$digest();
        expect(selected.direction).toEqual('down');
      });
    });

  });


  describe('selected.direction', function() {
    xit("can't be set to false", function() {
    });

    it('changes the clue', function() {
      selected.cell = cellA;
      $rootScope.$digest();
      expect(selected.clue).toBe(board.clues.across[0]);

      selected.direction = 'down';
      $rootScope.$digest();
      expect(selected.clue).toBe(board.clues.down[0]);
    });
  });

  describe('selected.clue', function() {
    it('changes the selected cell and direction', function() {
      selected.cell = cellA;
      $rootScope.$digest();

      expect(selected.direction).toEqual('across');
      expect(selected.clue).toBe(board.clues.across[0]);

      selected.clue = board.clues.down[1];
      $rootScope.$digest();
      expect(selected.cell).toBe(board.grid.cells[0][1]);
      expect(selected.direction).toEqual('down');
    });
  });

  describe('movements', function() {


    describe('#flipDirection', function() {
      it('flips the direction', function() {
        selected.cell = cellA;
        selected.direction = 'across';
        $rootScope.$digest();

        selected.flipDirection();
        expect(selected.direction).toEqual('down');
      });
    });

    describe('#previous', function() {
      it('selects the cell to the left when the current direction is "across"',
      function() {
        selected.cell = board.grid.cells[0][1];
        selected.direction = 'across';
        $rootScope.$digest();

        selected.previous();
        expect(selected.cell).toBe(board.grid.cells[0][0]);
      });

      it('selects the cell above when the current direction is "down"',
      function() {
        selected.cell = board.grid.cells[1][1];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.previous();
        expect(selected.cell).toBe(board.grid.cells[0][1]);
      });

      it('will not go out of bounds', function() {
        var start = board.grid.cells[0][0];
        selected.cell = start;
        selected.direction = 'across';
        $rootScope.$digest();

        selected.previous();
        expect(selected.cell).toBe(start);

        selected.direction = 'down';
        $rootScope.$digest();

        selected.previous();
        expect(selected.cell).toBe(start);
      });

      it('will skip over block cells', function() {
        selected.cell = board.grid.cells[2][0];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.previous();
        expect(selected.cell).toBe(board.grid.cells[0][0]);
      });

      it('will not skip over block cells and go out of bounds', function() {
        var start = board.grid.cells[1][1];
        selected.cell = start;
        selected.direction = 'across';
        $rootScope.$digest();

        selected.previous();
        expect(selected.cell).toBe(start);
      });

    });

    describe('#next', function() {
      it('selects the cell to the right when the current direction is "across"',
      function() {
        selected.cell = board.grid.cells[0][1];
        selected.direction = 'across';
        $rootScope.$digest();

        selected.next();
        expect(selected.cell).toBe(board.grid.cells[0][2]);
      });

      it('selects the cell below when the current direction is "down"',
      function() {
        selected.cell = board.grid.cells[1][1];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.next();
        expect(selected.cell).toBe(board.grid.cells[2][1]);
      });
    });

    describe('#left', function() {
      it('selects cell to the left', function() {
        selected.cell = board.grid.cells[0][1];
        selected.direction = 'across';
        $rootScope.$digest();

        selected.left();
        expect(selected.cell).toBe(board.grid.cells[0][0]);
      });

      it('changes the direction to across but does not change the cell ' +
         'if the current direction is "down"', function() {

        selected.cell = board.grid.cells[0][1];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.left();
        expect(selected.cell).toBe(board.grid.cells[0][1]);
        expect(selected.direction).toBe('across');
      })
    });

    describe('#right', function() {
      it('selects cell to the right', function() {
        selected.cell = board.grid.cells[0][1];
        selected.direction = 'across';
        $rootScope.$digest();

        selected.right();
        expect(selected.cell).toBe(board.grid.cells[0][2]);
      });

      it('changes the direction to across but does not change the cell ' +
         'if the current direction is "down"', function() {

        selected.cell = board.grid.cells[0][1];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.right();
        expect(selected.cell).toBe(board.grid.cells[0][1]);
        expect(selected.direction).toBe('across');
      })
    });

    describe('#up', function() {
      it('selects cell above', function() {
        selected.cell = board.grid.cells[1][1];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.up();
        expect(selected.cell).toBe(board.grid.cells[0][1]);
      });

      it('changes the direction to down but does not change the cell ' +
         'if the current direction is "across"', function() {

        selected.cell = board.grid.cells[1][1];
        selected.direction = 'across';
        $rootScope.$digest();

        selected.up();
        expect(selected.cell).toBe(board.grid.cells[1][1]);
        expect(selected.direction).toBe('down');
      })
    });

    describe('#down', function() {
      it('selects cell below', function() {
        selected.cell = board.grid.cells[1][1];
        selected.direction = 'down';
        $rootScope.$digest();

        selected.down();
        expect(selected.cell).toBe(board.grid.cells[2][1]);
      });

      it('changes the direction to down but does not change the cell ' +
         'if the current direction is "across"', function() {

        selected.cell = board.grid.cells[1][1];
        selected.direction = 'across';
        $rootScope.$digest();

        selected.down();
        expect(selected.cell).toBe(board.grid.cells[1][1]);
        expect(selected.direction).toBe('down');
      })
    });
  });

});

jasmine.MAX_PRETTY_PRINT_DEPTH = 2;

function jasmineToStringDecorator(jasmineToString) {
  return function($delegate) {
    return {
      create: function() {
        var obj = $delegate.create.apply($delegate, arguments);
        obj.jasmineToString = jasmineToString;
        return obj;
      }
    }
  }
}

