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


mod.service('CrosswordData', function() {
  this.get = function() {
    var crossword = new Crossword();

    angular.forEach(crosswordData.across, function(a) {
      crossword.across.add(a.number, a.clue, a.row, a.col, a.length);
    });

    angular.forEach(crosswordData.down, function(d) {
      crossword.down.add(d.number, d.clue, d.row, d.col, d.length);
    });
    return crossword;
  };
});


mod.controller('MainCtrl', function ($scope, $document, CrosswordData) {

  var crossword = CrosswordData.get();


  var rows = $scope.rows = [];

  function SelectedManager() {

    var selected = {
      cell: false,
      questions: {
        across: false,
        down: false,
      }
    };

    function _clearCell() {
        if (selected.cell) {
          selected.cell.selected = false;
        }
        selected.cell = false;
    }

    function _clearQuestions() {
      var across = selected.questions.across;
      selected.questions.across = false;

      if (across) {
        across.setHighlight(false);
      }

      var down = selected.questions.down;
      selected.questions.down = false;

      if (down) {
        down.setHighlight(false);
      }
    }

    function _question(question) {
      selected.questions[question.direction] = question;
      question.setHighlight(true);
    }

    
    this.cell = function(cell) {
      if (!cell.empty() && cell !== selected.cell) {

        _clearCell();
        _clearQuestions();

        selected.cell = cell;
        cell.selected = true;

        if (cell.questions.across) {
          _question(cell.questions.across);
        }

        if (cell.questions.down) {
          _question(cell.questions.down);
        }
      }
    };

    this.question = function(question) {
      this.cell(question.getCell(0));
    };
  }

  $scope.select = new SelectedManager();


  function initCells(width, height) {
    // Initialize all cells.
    for (var i = 0; i < height; i++) {
      var row = [];
      rows.push(row);

      for (var j = 0; j < width; j++) {

        row.push({
          number: '',
          content: '',
          questions: {
            across: false,
            down: false,
          },
          highlight: false,
          selected: false,

          empty: function() {
            return !this.questions.across && !this.questions.down;
          },

          cssClass: function() {
            var self = this;

            return {
              empty: self.empty(),
              highlight: self.highlight,
              selected: self.selected,
            }
          },
        });
      }
    }
  }

  var questions = $scope.questions = {
    across: [],
    down: [],
  };

  function addQuestion(question) {

    // Create a wrapper around the question that is more specific
    // to this controller.
    var wrapper = {
      question: question,
      number: question.number,
      clue: question.clue,
      direction: question._direction,
      _highlighted: false,

      forEachCell: function(callback) {
        this.question.forEachCell(function(row, col) {
          callback(rows[row][col]);
        });
      },

      cssClass: function() {
        var self = this;
        return {
          highlight: self._highlighted,
        }
      },

      isHighlighted: function() {
        return this._highlighted;
      },

      setHighlight: function(val) {
        val = Boolean(val);
        this._highlighted = val;
        this.forEachCell(function(cell) {
          cell.highlight = val;
        });
      },

      getCell: function(idx) {
        if (this.direction == 'across') {
          return rows[this.question._row][this.question._col + idx];
        } else {
          return rows[this.question._row + idx][this.question._col];
        }
      },
    };

    // Link this question to each of its cells.
    wrapper.forEachCell(function(cell) {
      cell.questions[wrapper.direction] = wrapper;
    });

    // Set the cell number of the first cell in the question.
    wrapper.getCell(0).number = wrapper.number;

    questions[wrapper.direction].push(wrapper);
  };

  initCells(crossword.across.max(), crossword.down.max());
  angular.forEach(crossword.across.get(), addQuestion);
  angular.forEach(crossword.down.get(), addQuestion);


  $document.keypress(function(event) {
    if (currentSelected) {
      if (event.which != 0 && event.charCode != 0) {
        var c = String.fromCharCode(event.which);

        $scope.$apply(function() {
          currentSelected.content = c;
        });

      } else {
      }
    }
  });

});
