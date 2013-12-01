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


  /*
    A junk puzzle to use for testing.

    f o o # b a # 
    o f n # a t o
    o f # # t l n
    */
    var crossword = new Crossword();

    var base = 'Question: ';
    crossword.across.add(base + 'foo', 0, 0, 3);
    crossword.across.add(base + 'ba',  4, 0, 2);
    crossword.across.add(base + 'ofn', 0, 1, 3);
    crossword.across.add(base + 'ato', 4, 1, 3);
    crossword.across.add(base + 'of',  0, 2, 2);
    crossword.across.add(base + 'tln', 4, 2, 3);

    crossword.down.add(base + 'foo', 0, 0, 3);
    crossword.down.add(base + 'off', 1, 0, 3);
    crossword.down.add(base + 'on',  2, 0, 2);
    crossword.down.add(base + 'bat', 4, 0, 3);
    crossword.down.add(base + 'atl', 5, 0, 3);
    crossword.down.add(base + 'on',  6, 1, 2);


mod.controller('MainCtrl', function ($scope) {

  $scope.crossword = crossword;

  // TODO well...this is all rather a mess, and probably very inefficient

  function buildTable() {
    var rows = $scope.rows = [];
  
    for (var i = 0, ii = crossword.down.max(); i < ii; i++) {
      var row = [];
      rows.push(row);

      for (var j = 0, jj = crossword.across.max(); j < jj; j++) {
        row.push(false);
      }
    }

    var questions = crossword.down.get().concat(crossword.across.get());
    angular.forEach(questions, function(q) {
      q.forEachChar(q.guess(), function(c, col, row) {

        if (c) {
          rows[row][col] = c;
        } else if (rows[row][col] === false) {
          rows[row][col] = '';
        }
      });
    });
  }

  crossword.down.get(1).guess('off');

  buildTable();

  $scope.buildTable = buildTable;

});
