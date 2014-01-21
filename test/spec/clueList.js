describe('clueList directive', function() {

  var $compile, scope, clueA, clueB, completeClue, clueElements;

  beforeEach(function() {
    module('dempsy.clue');
    module('dempsy.clueList');
    module('templates');

    inject(function(Clue, _$compile_, _$rootScope_) {
      clueA = Clue.create(1, 'clue 1', 'across');
      clueA.isComplete = function() { return false; }

      clueB = Clue.create(2, 'clue 2', 'across');
      clueB.isComplete = function() { return false; }

      completeClue = Clue.create(3, 'clue 3', 'across');
      completeClue.isComplete = function() { return true; }

      $compile = _$compile_;
      scope = _$rootScope_.$new();

      scope.clues = [clueA, clueB, completeClue];
      scope.selected = clueB;

      var tpl ="<div><clue-list clues='clues' selected='selected' " +
               "           secondary='secondary'></clue-list></div>";

      var element = $compile(tpl)(scope);
      scope.$digest();

      clueElements = element.find('.clue');
    });
  });

  function expectContent(clue, number, text, selected, complete) {
    var el = angular.element(clue);
    var number = el.find('.clue-number').text();
    var text = el.find('.clue-text').text();
    expect(number).toEqual(number);
    expect(text).toEqual(text);

    if (selected) {
      expect(el.hasClass('selected')).toEqual(true);
    } else {
      expect(el.hasClass('selected')).toEqual(false);
    }

    if (complete) {
      expect(el.hasClass('complete')).toEqual(true);
    } else {
      expect(el.hasClass('complete')).toEqual(false);
    }
  }

  it('has clue number and text', function() {
    expectContent(clueElements[0], '1', 'clue 1', false, false);
  });

  it('adds a "selected" css class for selected clues', function() {
    expectContent(clueElements[1], '2', 'clue 2', true, false);
  });

  it('adds a "complete" css class for complete clues', function() {
    expectContent(clueElements[2], '3', 'clue 3', false, true);
  });

  it('changes the selected clue when clicked', function() {
    angular.element(clueElements[2]).click();
    scope.$digest();
    expect(scope.selected).toEqual(completeClue);
  });

});
