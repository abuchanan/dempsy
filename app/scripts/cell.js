'use strict';

var mod = angular.module('dempsy.cell', []);

mod.service('Cell', function() {

  this.create = function(key) {

    return {
      key: key,
      number: '',
      content: '',

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
        return !this.isBlock &&
               (this.neighbors.left == false || this.neighbors.left.isBlock);
      },
      startsDown: function() {
        return !this.isBlock &&
               (this.neighbors.up == false || this.neighbors.up.isBlock);
      },

      isBlock: false,
    }
  };
});
