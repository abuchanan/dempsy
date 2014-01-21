describe('KeyBindings', function() {

  var editor;

  var mockDocument = {
    callbacks: [],
    keypress: function(callback) {
      this.callbacks.push(callback);
    },
    fire: function() {
      angular.forEach(this.callbacks, function(callback) {
        var event = {
          which: 97,
          charCode: 97,
        };
        callback(event);
      });
    },
  };

  beforeEach(function() {
    module('dempsy.editor');

    module(function($provide) {
      $provide.value('$document', mockDocument);
    });

    inject(function(Editor) {
      editor = Editor;
    });
  });

  /*
  describe('#on()', function() {

    it('broadcasts an "update" event when character keys are pressed', function() {
      // TODO bleh. look into ngscenario, protractor,
      //      and better ways to test document events
      var spy = jasmine.createSpy();
      editor.on('update', spy);
      mockDocument.fire();
      expect(spy).toHaveBeenCalled();
      expect(spy.mostRecentCall.args[1]).toEqual('a');
    });

  });
  */

});
