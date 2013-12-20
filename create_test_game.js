var fs = require('fs');
var file = __dirname + '/mongo-crossword-import.json';

var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost/dempsy1';

mongo.MongoClient.connect(mongoUri, function (err, db) {
  if (err) throw err;

  var games = db.collection('games');
  var boards = db.collection('boards');

  fs.readFile(file, 'utf8', function(err, data) {
    if (err) throw err;

    data = JSON.parse(data);
    boards.insert(data, function(err, records) {
      
      games.insert({board_id: records[0]._id, content: {}}, function(err, game_recs) {
        console.log('Game created at: http://localhost:8081/#/crossword/' + game_recs[0]._id);
        db.close();
      });
    });
  });
});
