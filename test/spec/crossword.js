'use strict';


function repeatChar(c, n) {
  return Array(n + 1).join(c);
}

describe('Crossword', function () {

  // load the controller's module
  beforeEach(module('dempsy.crossword'));

  var crossword;

  /*
    A junk puzzle to use for testing.

    f o o # b a # 
    o f n # a t o
    o f # # t l n

    Answers
    Across:
    1. foo
    2. ba
    3. ofn
    4. ato
    5. of
    6. tln

    Down:
    1. foo
    2. off
    3. on
    4. bat
    5. atl
    6. on
  */
  var answers = {
    across: ['foo', 'ba', 'ofn', 'ato', 'of', 'tln'],
    down: ['foo','off','on','bat','atl','on'],
  };


  beforeEach(inject(function () {
    crossword = new Crossword();

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

  }));


  it('adds questions using direction.add(text, x_position, y_position, length)',
  function() {

    var crossword = new Crossword();
    var q = crossword.across.add('question text', 0, 1, 5);
    q.should.have.property('text', 'question text');
  });


  it('provides access to questions via direction.get([num])', function() {

    var q = crossword.across.get(0);
    q.text.should.eql('Question: foo');

    crossword.across.get().should.deep.equal([
      crossword.across.get(0),
      crossword.across.get(1),
      crossword.across.get(2),
      crossword.across.get(3),
      crossword.across.get(4),
      crossword.across.get(5),
    ]);

    crossword.down.get().should.deep.equal([
      crossword.down.get(0),
      crossword.down.get(1),
      crossword.down.get(2),
      crossword.down.get(3),
      crossword.down.get(4),
      crossword.down.get(5),
    ]);
  });


  it('contains a guess for each question', function() {

    var q = crossword.across.get(0);
    q.guess().should.eql('');
    q.guess('baz');
    q.guess().should.eql('baz');

    // retrieve the same question again
    var r = crossword.across.get(0);
    // the guess is still stored
    r.guess().should.eql('baz');
  });


  it('validates guess length', function() {

    var q = crossword.across.get(0);

    // too long
    (function() {
      q.guess('foobartoobaz');
    }).should.Throw(ValidationError);

    // too short
    (function() {
      q.guess('fo');
    }).should.Throw(ValidationError);
  });


  it('keeps a history of guesses for each question', function() {

    var q = crossword.across.get(0);

    q.guess('abc');
    q.guess('def');

    q.guesses().should.deep.equal(['abc', 'def']);

    q.guess('ghi');
    q.guess('ghi');
    q.guess('abc');

    // guesses() returns a unique, ordered (most recent last) set of guesses
    var guesses = q.guesses()
    guesses.should.deep.equal(['def', 'ghi', 'abc']);

    // guesses is a copy of the internal array, so modifications shouldn't matter
    guesses.splice(1, 1);

    q.guesses().should.deep.equal(['def', 'ghi', 'abc']);
  });


  describe('#checkAnswers', function() {

    it('returns true when all guesses match', function() {
      for (var i = 0, ii = answers.across.length; i < ii; i++) {
        crossword.across.get(i).guess(answers.across[i]);
      }

      for (var i = 0, ii = answers.down.length; i < ii; i++) {
        crossword.down.get(i).guess(answers.down[i]);
      }

      crossword.checkAnswers(answers).should.be.true;
    });

    it("returns false when guesses don't match", function() {

      // Set junk guesses to all questions
      var questions = crossword.across.get().concat(crossword.down.get());

      for (var i = 0, ii = questions.length; i < ii; i++) {
        var q = questions[i];
        var guess = repeatChar('a', q.length());
        q.guess(guess);
      }

      crossword.checkAnswers(answers).should.be.false;
    });
  });


  it('allows the current guess to be cleared', function() {

    var q = crossword.across.get(0);
    q.guess('abc');
    q.guess('');
    q.guess().should.equal('');
  });


  it('validates that guess fits with selected guesses for surrounding questions',
  function() {

    /*
      f o o # b a # 
      o f n # a t o
      o f # # t l n
    */

    crossword.across.get(0).guess('foo');
    // first letter "b" doesn't match first letter of 1-across "f"
    (function() {
      crossword.down.get(0).guess('bar');
    }).should.Throw(ValidationError);

  });

});
