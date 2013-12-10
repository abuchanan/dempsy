'use strict';

var mod = angular.module('dempsy', [
  'dempsy.crossword',
  'ngRoute'
]);


mod.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});


var clues = {
  across: [
    "It's a no-no",
    "Up for it",
    "Hook attachment",
    "Shia's deity",
    "Letter-shaped beam",
    "Long ago",
    "Colorful food fish",
    "Kid around",
    "Mix up",
    "Deeply hurt",
    "Benevolent fellow",
    "Poem of exaltation",
    "Quitter's cry",
    "Abs strengtheners",
    "Big bash",
    "Partner of poivre",
    "Ark complement",
    "Checks for errors",
    "Ramadan observance",
    "Be testy with",
    "Pride member",
    "Little terror",
    "Genesis garden",
    "Attached, in a way",
    "Racial equality org.",
    "Whale group",
    "Suffix with butyl",
    "Gulliver's creator",
    "Mineralogists' samples",
    "Met solo",
    "Game played on a wall",
    "Scot's attire",
    "Took a turn",
    "Like leprechauns",
    "To be, to Brutus",
    "Scots' turndowns",
    "Conical dwelling",
  ],
  down: [
    "\"___ Te Ching\"",
    "Yodeler's setting",
    "Semiformal",
    "Pearl Harbor site",
    "\"Come on, that's enough!\"",
    "Doll for boys",
    "Help in wrongdoing",
    "Kind of note",
    "Art Deco notable",
    "Petty officer",
    "Class clown's doings",
    "Yule tree hanging",
    "Pulitzer winner Studs",
    "N.F.L. six-pointers",
    "Drink heartily",
    "\"I know what you're thinking\" ability",
    "Fish story teller",
    "www addresses",
    "Wordless \"Ouch!\"",
    "Summer month, in Paris",
    "Rock's ___ Lobos",
    "Sherlock Holmes prop",
    "Red tag event",
    "Klutzy",
    "___ about (rove)",
    "Excursion diversion",
    "Cel character",
    "S.F.-to-Spokane direction",
    "Bit of humor most people can't get",
    "Native New Zealanders",
    "Discussion groups",
    "Wrecker's job",
    "\"Finally finished!\"",
    "Social stratum",
    "Jr.-year exams",
    "Goldie of \"Laugh-In\"",
    "General vicinity",
    "Punch-in time for many",
    "MetroCard cost",
    "\"The Waste Land\" monogram",
    "___-crab soup",
  ]
};



mod.controller('BuilderCtrl', function($scope) {
  var gridSize = 15;

  var rows = $scope.rows = [];

  for (var i = 0; i < gridSize; i++) {
    var row = [];
    rows.push(row);

    for (var j = 0; j < gridSize; j++) {
        row.push({
          number: '',
          content: '',
          empty: false,
          isAcross: false,
          isDown: false,
          toggleEmpty: function() {
            this.empty = !this.empty;
          },
          cssClass: function() {
            if (this.empty) {
              return 'empty';
            } else {
              return '';
            }
          },
        });
    }
  }

  $scope.inspect = function() {
    var num = 1;
    var downIdx = 0;
    var acrossIdx = 0;

    var crossword = {
      size: gridSize,
      across: {},
      down: {},
    };

    var currentAcrosses = {};
    var currentDowns = {};

    for (var row = 0; row < gridSize; row++) {
      for (var col = 0; col < gridSize; col++) {
        var cell = rows[row][col];

        if (cell.empty) {

          if (currentDowns[col]) {
            var d = currentDowns[col];
            delete currentDowns[col];
            d.length = row - d.row;
            crossword.down[d.number] = d;
          }

          if (currentAcrosses[row]) {
            var a = currentAcrosses[row];
            delete currentAcrosses[row];
            a.length = col - a.col;
            crossword.across[a.number] = a;
          }

        } else {

          if (row == 0) {
            cell.isDown = true;
          }

          if (col == 0) {
            cell.isAcross = true;
          }

          if (row > 0) {
            var cellAbove = rows[row - 1][col];
            if (cellAbove.empty) {
              cell.isDown = true;
            }
          }

          if (col > 0) {
            var cellLeft = rows[row][col - 1];
            if (cellLeft.empty) {
              cell.isAcross = true;
            }
          }

          if (cell.isAcross || cell.isDown) {
            cell.number = num++;
            cell.row = row;
            cell.col = col;
          }

          if (cell.isDown && cell.isAcross) {

              var downCell = angular.extend({}, cell);
              downCell.clue = clues.down[downIdx];
              currentDowns[col] = downCell;
              downIdx++;

              cell.clue = clues.across[acrossIdx];
              currentAcrosses[row] = cell;
              acrossIdx++;
          }

          else if (cell.isDown) {
            cell.clue = clues.down[downIdx];
            currentDowns[col] = cell;
            downIdx++;
          }

          else if (cell.isAcross) {
            cell.clue = clues.across[acrossIdx];
            currentAcrosses[row] = cell;
            acrossIdx++;
          }

        }
      }
    }

    angular.forEach(currentDowns, function(down) {
      down.length = gridSize - down.row;
      crossword.down[down.number] = down;
    });

    angular.forEach(currentAcrosses, function(across) {
      across.length = gridSize - across.col;
      crossword.across[across.number] = across;
    });

    $scope.crosswordJson = angular.toJson(crossword);


  };
});


mod.controller('MainCtrl', function ($scope) {

  $scope.word = /^\w$/;

  var crossword = new Crossword();

  angular.forEach(crosswordData.across, function(a, num) {
    crossword.across.add(num, a.clue, a.row, a.col, a.length);
  });

  angular.forEach(crosswordData.down, function(d, num) {
    crossword.down.add(num, d.clue, d.row, d.col, d.length);
  });

  crossword.across.get(1).guess('abcde');


  $scope.crossword = crossword;

  // TODO well...this is all rather a mess, and probably very inefficient

  function buildTable() {
    var rows = $scope.rows = [];
  
    // initialize all cells
    for (var i = 0, ii = crossword.down.max(); i < ii; i++) {
      var row = [];
      rows.push(row);

      for (var j = 0, jj = crossword.across.max(); j < jj; j++) {
        row.push({
          number: '',
          content: '',
          empty: true,
          isAcross: false,
          isDown: false,
          toggleEmpty: function() {
            this.empty = !this.empty;
          },
          cssClass: function() {
            if (this.empty) {
              return 'empty';
            } else {
              return '';
            }
          },
        });
      }
    }

    // now fill in the cells that have content

    function updateCells(q) {
      var charIdx = 0;

      q.forEachChar(q.guess(), function(c, row, col) {

        var cell = rows[row][col];
        cell.empty = false;

        if (charIdx == 0) {
          cell.number = q.number;
        }

        if (c) {
          cell.content = c;
        }

        charIdx++;
      });
    }

    angular.forEach(crossword.across.get(), updateCells);
    angular.forEach(crossword.down.get(), updateCells);
  }


  buildTable();

  $scope.buildTable = buildTable;

});
