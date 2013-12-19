var connect = require('connect'),
    http = require('http'),
    fs = require('fs'),
    io = require('socket.io');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('app'));

var server = http.createServer(app)
server.listen(8081);


var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost/dempsy1';

mongo.MongoClient.connect(mongoUri, function (err, db) {
  if (err) throw err;

  var games = db.collection('games');
  var boards = db.collection('boards');

  io.listen(server).sockets.on('connection', function (socket) {

    socket.on('load game', function(ID, callback) {
      socket.join('crossword-room-' + ID);

      // TODO handle bad game ID
      var gameObjID = new mongo.ObjectID(ID);

      games.findOne({'_id': gameObjID}, function(err, game) {
        
        var boardObjID = new mongo.ObjectID(game.board_id);

        boards.findOne({'_id': boardObjID}, function(err, board) {
          callback({
            board: board,
            content: game.content,
          });
        });
      });
    });

    socket.on('update cell', function(data) {

      // TODO delete if content is empty?
      console.log('update cell', data);

      games.findOne({'_id': data.game_ID}, function(doc) {
        doc.content[data.cell_ID] = data.content;
        games.save(doc);

        socket.broadcast.to('crossword-room-' + data.game_ID)
          .emit('cell updated', {
            cell_ID: data.cell_ID,
            content: data.content,
          });
      });

    });
  });
});
