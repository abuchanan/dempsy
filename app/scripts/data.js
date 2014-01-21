'use strict';

var mod = angular.module('dempsy.data', [
  'btford.socket-io',
]);


mod.service('CrosswordData', function(socket, $q, Grid, Board, $timeout, $rootScope) {

  this.list = function() {
    var deferred = $q.defer();
    socket.emit('list games', {}, function(data) {
      deferred.resolve(data);
    });

    return deferred.promise;
  };

  this.get = function(id) {

    var deferred = $q.defer();

    socket.emit('load game', id, function(data) {

      var grid = Grid.create(data.board.size, data.board.blocks);
      var board = Board.create(grid, data.board.clues, data.content);

      grid.forEachCell(function(cell) {
        $rootScope.$watch(function() { return cell.content }, function() {
          socket.emit('update cell', {
            game_ID: id,
            cell_ID: cell.key,
            content: cell.content,
          });
        });
      });

      socket.on('cell updated', function(data) {
        var row = data.cell_ID[0];
        var col = data.cell_ID[1];
        board.cells[row][col].content = data.content;
      });

      var room = {
        clients: [],
      };
      // In milliseconds
      // TODO configurable
      var roomUpdateInterval = 5 * 1000;

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
