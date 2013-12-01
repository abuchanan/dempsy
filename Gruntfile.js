'use strict';

module.exports = function (grunt) {

  require('time-grunt')(grunt);

  var TASK_DIR = './tasks/';

  var config = {
    // TODO replace "yeoman"
    yeoman: {
      app: 'app',
      dist: 'dist'
    },
  };

  // TODO TaskLoader, allows default config and tasks
  function loadTasks(tasks) {
    var toLoad = {};

    tasks.forEach(function(taskName) {
      var task = require(TASK_DIR + taskName + '.js');

      if (task.load) {
        task.load.forEach(function(name) {
          toLoad[name] = 1;
        });
      }

      if (task.config) {
        // TODO using underscore is deprecated?
        //      could use recurse
        grunt.util._.extend(config, task.config);
      }
    });

    Object.keys(toLoad).forEach(function(name) {
      grunt.loadNpmTasks(name);
    });

    // TODO initConfig or return config object?
    grunt.initConfig(config);
  }

  grunt.registerTask('server', function () {

    loadTasks(['copy', 'clean', 'autoprefixer', 'connect', 'watch']);

    // TODO concurrent is broken for some reason. it doesn't get the same
    //      config and copy:styles is missing

    grunt.task.run([
      'clean:server',
      'copy:styles',
      'autoprefixer',
      'connect:livereload',
      'watch',
    ]);
  });


  grunt.registerTask('test', function() {

    loadTasks(['karma', 'watch']);

    grunt.task.run([
      'karma:unit',
      'watch:karma',
    ]);
  });
};
