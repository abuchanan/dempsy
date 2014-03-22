var jsdom = require("jsdom");

// Parse command line options
var argv = require('minimist')(process.argv.slice(2));

var target = argv['_'][0];

function scrape(html) {
  jsdom.env(
      html,
      ["http://code.jquery.com/jquery.js"],
    function (errors, window) {

      var $ = window.$;
      var title = $('#CPHContent_TitleLabel').text()

      var board = $('#CPHContent_PuzTable');
      var first_row = board.find('tr:first > td');

      var board_size = first_row.length;
      var blocks = [];

      board.find('td').each(function(idx, el) {
        el = $(el);

        if (el.hasClass('vblack')) {
          var row = Math.floor(idx / board_size);
          var col = idx % board_size;
          blocks.push([row, col]);
        }
      });

      var clue_rx = /\d+\. (.*) : /;

      function scrape_clues(element) {
        var clues = [];

        $(element).contents().each(function(idx, el) {
          var text = $(el).text();
          if (text) {
            //console.log('++++++++++++++++++++++++++++++++++++++++++++++++');
            //console.log(text);
            var match = text.match(clue_rx);
            if (match) {
              //console.log(match[1]);
              clues.push(match[1]);
            } else {
              //console.log('answer');
            }
          }
        });

        return clues;
      }

      var across_clues = scrape_clues($('#CPHContent_AcrossClues'));
      var down_clues = scrape_clues($('#CPHContent_DownClues'));

      var dempsy_board = {
        'board': {
          'shape': 'square',
          'size': board_size,
          'blocks': blocks,
          'clues': {
            'across': across_clues,
            'down': down_clues,
          }
        },
        'game': {
          'title': title,
        }
      };

      console.log(JSON.stringify(dempsy_board));
    }
  );
}


var request = require('request');

function getPage(uri, callback) {
  request({
    uri: uri,
    headers:{'User-Agent': 'Mozilla/5.0'}},
    function (error, response, body) {
      //console.log("Fetched " + someUri + " OK!");
      callback(body);
    });
}

getPage(target, scrape);
