'use strict';

var mod = angular.module('dempsy.clue', []);

mod.service('Clue', function() {

  this.create = function(number, text, direction) {
    return {
      text: text,
      number: number,
      direction: direction,
      cells: [],
      _highlighted: false,

      cssClass: function() {
        var self = this;

        // If the clue has all its cells filled,
        // give it the "complete" class.
        var complete = true;
        angular.forEach(self.cells, function(cell) {
          if (!cell.content()) {
            complete = false;
          }
        });

        var d = {
          highlight: self._highlighted,
          complete: complete,
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
