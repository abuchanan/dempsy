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

var gamesData = {
  games: {
    todo: {
      content: {},
    },
    foo: {
      content: {},
    },
  },
};

io.listen(server).sockets.on('connection', function (socket) {

  socket.on('load crossword', function(ID, callback) {
    socket.join('crossword-room-' + ID);

    // TODO handle bad game ID

    fs.readFile(crosswordDataPath, 'utf8', function(err, data) {
      data = JSON.parse(data);
      data.content = gamesData.games[ID].content;
      callback(data);
    });

  });

  socket.on('update cell', function(data) {
    // TODO delete if content is empty?
    console.log('update cell', data);
    gamesData.games[data.board_ID].content[data.cell_ID] = data.content;

    socket.broadcast.to('crossword-room-' + data.board_ID).emit('cell updated', {
    //socket.broadcast.emit('cell updated', {
      cell_ID: data.cell_ID,
      content: data.content,
    });

  });
});
