var connect = require('connect'),
    http = require('http'),
    fs = require('fs'),
    io = require('socket.io');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('app'));

var server = http.createServer(app)
server.listen(8081);

var crosswordDataPath = __dirname + '/app/crossword2.json';

var gameData = {
  games: {
    todo: {
      content: {},
    },
  },
};

// TODO weird
io = io.listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('load crossword', function(ID, callback) {

    fs.readFile(crosswordDataPath, 'utf8', function(err, data) {
      data = JSON.parse(data);
      data.content = gameData.games[ID].content;
      callback(data);
    });

  });

  socket.on('update cell', function(data) {
    console.log(data);
    var key = [data.row, data.col];
    gameData.games[data.board].content[key] = data.content;
  });
});
