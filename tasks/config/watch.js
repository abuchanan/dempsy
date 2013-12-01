module.exports = {
  load: ['grunt-contrib-watch'],
  config: {
    styles: {
      files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
      tasks: ['copy:styles', 'autoprefixer']
    },
    livereload: {
      options: {
        livereload: '<%= connect.options.livereload %>'
      },
      files: [
        '<%= yeoman.app %>/{,*/}*.html',
        '.tmp/styles/{,*/}*.css',
        '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
        '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
      ]
    },
    karma: {
      files: [
        'app/scripts/*.js',
        'app/scripts/**/*.js',
        'test/spec/*.js',
        'test/spec/**/*.js',
       ],
      tasks: ['karma:unit:run'],
    }
  }
}
