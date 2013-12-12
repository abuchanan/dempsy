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
var currentGameData = [];

// TODO weird
io = io.listen(server);

var current_data = {};

io.sockets.on('connection', function (socket) {
  socket.on('load crossword', function(ID, callback) {

    fs.readFile(crosswordDataPath, 'utf8', function(err, data) {
      data = JSON.parse(data);
      callback(data);
    });

  });

  socket.on('update cell', function(cell) {
    console.log(cell);
  });
});
