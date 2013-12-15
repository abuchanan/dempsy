'use strict';

var mod = angular.module('dempsy.data', []);

mod.service('CrosswordData', function(socket, $q, Board) {
  this.get = function(id) {

    var deferred = $q.defer();

    socket.emit('load crossword', id, function(data) {

      var board = Board.build(data.board.size, data.board.blocks, data.board.clues);
      deferred.resolve(board);
      
    });
    return deferred.promise;
  };

  this.updateCell = function(row, col, content) {
    // TODO notice update failures
    var data = {
      row: row,
      col: col,
      content: content,
    };

    socket.emit('update cell', data);
  };
});
