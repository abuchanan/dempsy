'use strict';

var mod = angular.module('dempsy.crossword', []);


function ValidationError() {}


function Guesses() {
  this._guesses = [];
}

Guesses.prototype = {

  add: function(guess) {

    var idx = this._guesses.indexOf(guess);
    if (idx != -1) {
      this._guesses.splice(idx, 1);
    }
    this._guesses.push(guess);
  },

  get: function() {
    // Return a copy of the internal array to prevent external modifications
    return this._guesses.slice(0);
  }
};


function _Question(number, clue, direction, row, col, length, crossingCollection) {
  this.number = number;
  this.clue = clue;

  this._direction = direction;
  this._row = row;
  this._col = col;
  this._length = length;
  this._crossingCollection = crossingCollection;

  this._guess = '';
  this._guesses = new Guesses();
}

_Question.prototype = {

  forEachChar: function(text, callback) {

    if (this._direction == 'across') {
      var start = this._col;
      var constant = this._row;

      for (var i = 0, ii = this._length; i < ii; i++) {
        callback(text.charAt(i), constant, start + i);
      }

    } else {
      var start = this._row;
      var constant = this._col;

      for (var i = 0, ii = this._length; i < ii; i++) {
        callback(text.charAt(i), start + i, constant);
      }
    }
  },

  _validate: function(guess) {

    if (guess.length != this._length) {
      // TODO better error
      return false;
    }

    var q = this;
    var valid = true;

    this.forEachChar(guess, function(c, row, col) {
      var crossingChar = q._crossingCollection.charAt(row, col);
      if (crossingChar && c != crossingChar) {
        // TODO better error
        valid = false;
      }
    });

    return valid;
  },

  length: function() {
    return this._length;
  },

  guess: function(text) {

    if (text !== undefined) {
      if (text == '') {
        this._guess = text;

      } else {
        if (this._validate(text)) {
          this._guess = text;
          this._guesses.add(text);
        } else {
          this._guess = '';
        }
      }
    }
    return this._guess;
  },

  guesses: function() {
    return this._guesses.get();
  },

  contains: function(row, col) {
    if (this._direction == 'across') {
      return this._row == row && col >= this._col && col <= this._col + this._length;
    } else {
      return this._col == col && row >= this._row && row <= this._row + this._length;
    }
  },

  charAt: function(row, col) {

    if (this._direction == 'across') {
      var p = col - this._col;
    } else {
      var p = row - this._row;
    }
    return this._guess.charAt(p);
  },
};


function _QuestionCollection(direction) {
  this._questions = [];
  this._max = 0;

  // TODO validate direction
  this._direction = direction;
  this._crossingCollection = null;
}

_QuestionCollection.prototype = {

  add: function(number, clue, row, col, length) {

    // TODO test
    if (this._direction == 'across') {
      if (col + length > this._max) {
        this._max = col + length;
      }
    } else {
      if (row + length > this._max) {
        this._max = row + length;
      }
    }
    // TODO shoudn't be able to add if crossing collection is null
    // TODO validate that it doesn't overlap some other question?
    // TODO replace add with init and add in bulk?

    var q = new _Question(number, clue, this._direction, row, col, length,
                          this._crossingCollection);

    this._questions[number] = q;
    return q;
  },

  max: function() {
    return this._max;
  },

  get: function(idx) {
    if (idx === undefined) {
      // Return a copy in order to prevent external modifications
      return angular.extend({}, this._questions);
    }
    // TODO catch index error
    return this._questions[idx];
  },

  charAt: function(row, col) {
    angular.forEach(this._questions, function(q) {
      if (q.contains(row, col)) {
        return q.charAt(row, col);
      }
    });
  },
};


function Crossword() {
  this.across = new _QuestionCollection('across');
  this.down = new _QuestionCollection('down');

  this.across._crossingCollection = this.down;
  this.down._crossingCollection = this.across;
}

Crossword.prototype = {
  checkAnswers: function(answers) {
    var across_q = this.across.get();

    for (var i = 0, ii = answers.across.length; i < ii; i++) {
      if (across_q[i].guess() != answers.across[i]) {
        return false;
      }
    }

    var down_q = this.down.get();

    for (var i = 0, ii = answers.down.length; i < ii; i++) {
      if (down_q[i].guess() != answers.down[i]) {
        return false;
      }
    }

    return true;
  },
};
