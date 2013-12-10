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


function _Question(number, text, direction, x, y, length, crossingCollection) {
  this.number = number;
  this.text = text;

  this._direction = direction;
  this._x = x;
  this._y = y;
  this._length = length;
  this._crossingCollection = crossingCollection;

  this._guess = '';
  this._guesses = new Guesses();
}

_Question.prototype = {

  forEachChar: function(text, callback) {

    if (this._direction == 'across') {
      var start = this._x;
      var constant = this._y;

      for (var i = 0, ii = this._length; i < ii; i++) {
        callback(text.charAt(i), start + i, constant);
      }

    } else {
      var start = this._y;
      var constant = this._x;

      for (var i = 0, ii = this._length; i < ii; i++) {
        callback(text.charAt(i), constant, start + i);
      }
    }
  },

  _validate: function(text) {

    if (text.length != this._length) {
      throw new ValidationError();
    }

    var q = this;

    this.forEachChar(text, function(c, x, y) {
      var e = q._crossingCollection.charAt(x, y)
      if (e && c != e) {
        throw new ValidationError();
      }
    });
  },

  length: function() {
    return this._length;
  },

  guess: function(text) {

    if (text !== undefined) {
      if (text == '') {
        this._guess = text;

      } else {
        this._validate(text);
        this._guess = text;
        this._guesses.add(text);
      }
    }
    return this._guess;
  },

  guesses: function() {
    return this._guesses.get();
  },

  contains: function(x, y) {
    if (this._direction == 'across') {
      return this._y == y && x >= this._x && x <= this._x + this._length;
    } else {
      return this._x == x && y >= this._y && y <= this._y + this._length;
    }
  },

  charAt: function(x, y) {

    if (this._direction == 'across') {
      var p = x - this._x;
    } else {
      var p = y - this._y;
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

  add: function(number, text, x, y, length) {

    // TODO test
    if (this._direction == 'across') {
      if (x + length > this._max) {
        this._max = x + length;
      }
    } else {
      if (y + length > this._max) {
        this._max = y + length;
      }
    }
    // TODO shoudn't be able to add if crossing collection is null
    // TODO validate that it doesn't overlap some other question?
    // TODO replace add with init and add in bulk?

    var q = new _Question(number, text, this._direction, x, y, length,
                          this._crossingCollection);

    this._questions.push(q);
    return q;
  },

  max: function() {
    return this._max;
  },

  // TODO change to 1-based?
  // TODO maybe get should _require_ idx, and have a separate method
  //      for getting all questions
  get: function(idx) {
    if (idx === undefined) {
      // Return a copy of the internal array to prevent external modifications
      return this._questions.slice(0);
    }
    // TODO catch index error
    return this._questions[idx];
  },

  charAt: function(x, y) {
    for (var i = 0, ii = this._questions.length; i < ii; i++) {
      var q = this._questions[i];
      if (q.contains(x, y)) {
        return q.charAt(x, y);
      }
    }
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
