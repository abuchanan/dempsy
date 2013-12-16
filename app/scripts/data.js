'use strict';

var mod = angular.module('dempsy.data', []);


mod.service('CrosswordData', function(socket, $q, Board) {

  this.get = function(id) {

    var deferred = $q.defer();

    socket.emit('load crossword', id, function(data) {

      var board = Board.build(data.board.size, data.board.blocks,
                              data.board.clues, data.content);

      board.on('update cell', function(event, cell) {
        socket.emit('update cell', {
          board: id,
          row: cell.row,
          col: cell.col,
          content: cell.content(),
        });
      });

      deferred.resolve(board);
    });
    return deferred.promise;
  };
});
