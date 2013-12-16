describe 'Cell', ->

  cell_a = cell_b = null

  beforeEach ->
    module 'dempsy.cell'
    inject (Cell) ->
      cell_a = Cell.create()
      cell_b = Cell.create()

  describe '#isBlock()', ->

    it 'should default to true', ->
      expect(cell_a.isBlock()).toEqual true

    it 'should be false when the cell has a clue in either direction', ->
      cell_a.clues.across = true
      expect(cell_a.isBlock()).toEqual false
      cell_b.clues.down = true
      expect(cell_b.isBlock()).toEqual false


  describe '#cssClass()', ->

    it 'should reflect isBlock()', ->
      expect(cell_a.cssClass().block).toEqual true
      cell_a.isBlock = -> false
      expect(cell_a.cssClass().block).toEqual false


  describe '#linkDown(other)', ->

    it 'should link its "previous" cell, in the "down" direction', ->
      cell_a.linkDown(cell_b)
      expect(cell_a.prev.down).toEqual cell_b
      expect(cell_b.next.down).toEqual cell_a


  describe '#linkAcross(other)', ->

    it 'should link its "previous" cell, in the "across" direction', ->
      cell_a.linkAcross(cell_b)
      expect(cell_a.prev.across).toEqual cell_b
      expect(cell_b.next.across).toEqual cell_a
