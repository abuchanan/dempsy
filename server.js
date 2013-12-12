var connect = require('connect'),
    http = require('http'),
    fs = require('fs'),
    io = require('socket.io');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('app'));

var server = http.createServer(app)
server.listen(8081);

var crosswordDataPath = __dirname + '/app/crossword.json';

// TODO weird
io = io.listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('load_crossword', function(ID, callback) {

    fs.readFile(crosswordDataPath, 'utf8', function(err, data) {
      data = JSON.parse(data);
      callback(data);
    });

  });
});
