describe('Clue', function() {

  var clue;
  var cell = {content: 'a'};
  var emptyCell = {content: ''};

  beforeEach(function() {
    module('dempsy.clue');

    inject(function(Clue) {
      clue = Clue.create(1, 'clue text', 'across');
    });
  });

  it('has a number, text, and direction', function() {
    expect(clue.number).toEqual(1);
    expect(clue.text).toEqual('clue text');
    expect(clue.direction).toEqual('across');
  });

  describe('#isComplete()', function() {
    it('returns true when all cells have content', function() {
      clue.cells = [cell, cell];
      expect(clue.isComplete()).toEqual(true);

      clue.cells = [cell, emptyCell];
      expect(clue.isComplete()).toEqual(false);
    });
  });

  describe('#hasCell(cell)', function() {
    it('returns true when clue.cells contains the given cell', function() {
      clue.cells = [emptyCell, cell];
      expect(clue.hasCell(cell)).toEqual(true);

      clue.cells = [emptyCell, emptyCell];
      expect(clue.hasCell(cell)).toEqual(false);
      
    });
  });
});
