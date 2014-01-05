'use strict';

var mod = angular.module('dempsy.cell', []);

mod.service('Cell', function($rootScope) {

  this.create = function(key) {

    var scope = $rootScope.$new(true);
    var _content = '';

    return {
      key: key,
      number: '',

      on: function() {
        scope.$on.apply(scope, arguments);
      },

      content: function(c, broadcast) {
        if (broadcast === undefined) {
          broadcast = true;
        }

        if (c !== undefined && _content != c) {
          _content = c;
          if (broadcast) {
            scope.$broadcast('update', this);
          }
        }
        return _content;
      },

      neighbors: {
        up: false,
        down: false,
        left: false,
        right: false,
      },

      clues: {
        across: false,
        down: false,
      },

      startsAcross: function() {
        return !this.isBlock && (this.neighbors.left == false || this.neighbors.left.isBlock);
      },
      startsDown: function() {
        return !this.isBlock && (this.neighbors.up == false || this.neighbors.up.isBlock);
      },

      highlight: false,
      highlightDirection: '',
      selected: false,

      isBlock: false,

      cssClass: function() {
        var self = this;

        var d = {
          block: self.isBlock,
          highlight: !self.selected && self.highlight,
          selected: self.selected,
        };
        d[self.highlightDirection] = true;
        return d;
      },
    }
  };
});
