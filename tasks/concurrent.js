module.exports = function(grunt, config) {
  grunt.loadNpmTasks('grunt-concurrent');

  config({
    server: [
      'copy:styles'
    ],
    test: [
      'copy:styles'
    ],
    dist: [
      'copy:styles',
      'imagemin',
      'svgmin',
      'htmlmin'
    ]
  });
}
