'use strict';

module.exports = function (grunt) {

  require('time-grunt')(grunt);

  var config = {
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },
  };

  var npm_tasks = [];

  function load_task(name) {
    var task = require('./tasks/config/' + name + '.js');

    // TODO would be better to just pass grunt and config
    //      to the task module and let it call these
    for (var i = 0, ii = task.load.length; i < ii; i++) {
      grunt.loadNpmTasks(task.load[i]);
    }

    var task_config = {};
    task_config[name] = task.config;

    grunt.util._.extend(config, task_config);
  }

  load_task('karma');
  load_task('watch');


  grunt.initConfig(config);


  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);


  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('foo', function() {
    grunt.task.run([
      'karma:unit',
      'watch:karma',
    ]);
  })
};
