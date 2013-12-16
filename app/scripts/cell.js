'use strict';

var mod = angular.module('dempsy.cell', []);

mod.service('Cell', function($rootScope) {

  function _link(next, prev, direction) {
    next.prev[direction] = prev;
    prev.next[direction] = next;
  }


  this.create = function(row, col) {

    var scope = $rootScope.$new(true);
    var _content = '';

    return {
      row: row,
      col: col,
      number: '',
      on: function() {
        scope.$on.apply(scope, arguments);
      },
      content: function(c) {
        if (c !== undefined) {
          _content = c;
          scope.$broadcast('update', this);
        }
        return _content;
      },
      next: {
        across: false,
        down: false,
      },
      prev: {
        across: false,
        down: false,
      },
      clues: {
        across: false,
        down: false,
      },

      highlight: false,
      highlightDirection: '',
      selected: false,

      isBlock: function() {
        return !this.clues.across && !this.clues.down;
      },

      cssClass: function() {
        var self = this;

        var d = {
          block: self.isBlock(),
          highlight: !self.selected && self.highlight,
          selected: self.selected,
        };
        d[self.highlightDirection] = true;
        return d;
      },
      _link: function(other, direction) {
        this.prev[direction] = other;
        other.next[direction] = this;
      },
      linkDown: function(other) {
        _link(this, other, 'down');
      },
      linkAcross: function(other) {
        _link(this, other, 'across');
      },
    }
  };
});
