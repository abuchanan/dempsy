var connect = require('connect'),
    http = require('http'),
    fs = require('fs'),
    io = require('socket.io');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('app'));

var port = process.env.PORT || 8081;

var server = http.createServer(app)
server.listen(port);


var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost/dempsy1';

mongo.MongoClient.connect(mongoUri, function (err, db) {
  if (err) throw err;

  var games = db.collection('games');
  var boards = db.collection('boards');

  var sockets = io.listen(server).sockets;

  sockets.on('connection', function (socket) {

    socket.on('list games', function(data, callback) {
      games.find().toArray(function(err, results) {
        var games = [];

        for (var i = 0; i < results.length; i++) {
          var res = results[i];
          var game = {
            ID: res._id,
            title: res.title || 'Untitled',
          }
          games.push(game);
        }

        callback(games);
      });
    });

    socket.on('save board', function(data, callback) {
      boards.insert(data, function(err, records) {
        var board_id = records[0]._id;
        games.insert({board_id: board_id, content: {}}, function(err, game_recs) {
          var game_id = game_recs[0]._id;
          console.log('Game created at: http://localhost:8081/#/crossword/' + game_id);

          callback({
            board: board_id,
            game: game_id,
          });
          db.close();
        });
      });
    });

    socket.on('load game', function(ID, callback) {
      socket.join('crossword-room-' + ID);

      // TODO handle bad game ID
      var gameObjID = new mongo.ObjectID(ID);

      games.findOne({'_id': gameObjID}, function(err, game) {
        
        // TODO clean this up. 
        if (game.board_id instanceof String) {
          var boardObjID = new mongo.ObjectID(game.board_id);
        } else {
          var boardObjID = game.board_id;
        }

        boards.findOne({'_id': boardObjID}, function(err, board) {
          callback({
            board: board,
            content: game.content,
          });
        });
      });
    });

    socket.on('list clients', function(ID, callback) {
      var clientSockets = sockets.clients('crossword-room-' + ID);
      var clientIds = [];
      for (var i = 0, ii = clientSockets.length; i < ii; i++) {
        var clientId = clientSockets[i].id;

        if (clientId != socket.id) {
          clientIds.push(clientId);
        }
        // TODO clientIds.push(clientSockets[i].store.data.name);
      }

      console.log(socket.id);
      callback(clientIds);
    });

    socket.on('update cell', function(data) {

      // TODO delete if content is empty?
      console.log('update cell', data);

      var query = {'_id': new mongo.ObjectID(data.game_ID)};

      games.findOne(query, function(err, game) {

        game.content[data.cell_ID] = data.content;

        games.save(game, function(err) {
          // TODO this would kill the server
          //      we should be able to transparently retry
          //      or at least send an error to the client
          if (err) throw err;

          socket.broadcast.to('crossword-room-' + data.game_ID)
            .emit('cell updated', {
              cell_ID: data.cell_ID,
              content: data.content,
            });

        });
      });

    });
  });
});
