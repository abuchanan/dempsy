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

io.listen(server).sockets.on('connection', function (socket) {

  socket.on('load crossword', function(ID, callback) {

    fs.readFile(crosswordDataPath, 'utf8', function(err, data) {
      data = JSON.parse(data);
      data.content = gameData.games[ID].content;
      callback(data);
    });

  });

  socket.on('update cell', function(data) {
    // TODO delete if content is empty?
    console.log(data);
    gameData.games[data.board_ID].content[data.cell_ID] = data.content;
  });
});
