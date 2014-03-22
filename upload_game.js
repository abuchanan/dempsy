var usage = 'usage: node upload_game.js -u <mongodb_user> -h <mongodb_host> -d <mongodb_database> -f <game.json>';

// Parse command line options
var argv = require('minimist')(process.argv.slice(2));

var user = argv['u'];
var host = argv['h'];
var db = argv['d'];
var file = argv['f'];

if (!user || !host || !db || !file) {
  console.log(usage);
  process.exit(1);
}


var fs = require('fs');
var mongo = require('mongodb');
var read = require('read');
var util = require('util');

read({prompt: 'Mongo DB password: ', silent: true}, function(er, password) {

  var mongoURI = util.format('mongodb://%s:%s@%s/%s', user, password, host, db);

  mongo.MongoClient.connect(mongoURI, function (err, db) {
    if (err) throw err;

    var games = db.collection('games');
    var boards = db.collection('boards');

    fs.readFile(file, 'utf8', function(err, raw_data) {
      if (err) throw err;

      data = JSON.parse(raw_data);
      boards.insert(data.board, function(err, records) {
        
        var game_data = {
          title: data.game.title,
          board_id: records[0]._id,
          content: {}
        };

        games.insert(game_data, function(err, game_recs) {
          console.log('Game created: ' + game_recs[0]._id);
          db.close();
        });
      });
    });
  });
});
