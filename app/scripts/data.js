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
          board_ID: id,
          cell_ID: [cell.row, cell.col],
          content: cell.content(),
        });
      });

      socket.on('cell updated', function(data) {
        console.log('cell updated', data);
        var row = data.cell_ID[0];
        var col = data.cell_ID[1];
        board.cells[row][col].content(data.content, false);
      });

      deferred.resolve(board);
    });
    return deferred.promise;
  };
});
