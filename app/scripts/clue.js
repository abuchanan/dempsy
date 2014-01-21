'use strict';

var mod = angular.module('dempsy.clue', []);

mod.service('Clue', function() {

  this.create = function(number, text, direction) {
    return {
      text: text,
      number: number,
      direction: direction,
      cells: [],

      isComplete: function() {
        var complete = true;
        angular.forEach(this.cells, function(cell) {
          if (!cell.content || cell.content == '') {
            complete = false;
          }
        });
        return complete;
      },

      hasCell: function(cell) {
        var idx = this.cells.indexOf(cell);
        return idx != -1;
      },
    }
  };
});
