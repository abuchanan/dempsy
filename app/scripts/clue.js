'use strict';

var mod = angular.module('dempsy.clue', []);

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
