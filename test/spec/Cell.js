describe('Cell', function() {

  var cell, other, blockCell;

  beforeEach(function() {
    module('dempsy.cell');

    inject(function(Cell) {
      cell = Cell.create('cell-key');
      other = Cell.create('other-cell-key');

      blockCell = Cell.create('block-cell-key');
      blockCell.isBlock = true;
    });
  });

  it('has a "key" property', function() {
    expect(cell.key).toEqual('cell-key');
  });

  it('determines startsAcross() and startsDown() ' + 
     'using isBlock and neighbors properties', function() {

    expect(cell.startsAcross()).toEqual(true);
    expect(cell.startsDown()).toEqual(true);

    expect(blockCell.startsAcross()).toEqual(false);
    expect(blockCell.startsDown()).toEqual(false);

    cell.neighbors.up = other;
    expect(cell.startsDown()).toEqual(false);

    cell.neighbors.left = other;
    expect(cell.startsAcross()).toEqual(false);

  });
});
