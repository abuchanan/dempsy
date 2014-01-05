'use strict';

var mod = angular.module('dempsy.data', []);


mod.service('CrosswordData', function(socket, $q, Grid, Board, $timeout) {

  this.get = function(id) {

    var deferred = $q.defer();

    socket.emit('load game', id, function(data) {

      var grid = Grid.create(data.board.size, data.board.blocks);
      var board = Board.build(grid, data.board.clues, data.content);

      board.on('update cell', function(event, cell) {
        socket.emit('update cell', {
          game_ID: id,
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

      var room = {
        clients: [],
      };
      // In milliseconds
      var roomUpdateInterval = 10 * 1000;

      // TODO should this really do polling? Maybe it should just wait for
      //      join/leave broadcast events? What if those are dropped?
      //      Should the server do the polling?
      function list_clients() {
        socket.emit('list clients', id, function(data) {
          room.clients = data;
        });
        $timeout(list_clients, roomUpdateInterval);
      }
      list_clients();


      deferred.resolve({
        board: board,
        room: room,
      });
    });
    return deferred.promise;
  };
});
