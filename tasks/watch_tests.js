module.exports = {
  load: ['grunt-contrib-watch'],
  config: {
    watch: {
      karma: {
        files: [
          'app/scripts/*.js',
          'app/scripts/**/*.js',
          'test/spec/*.js',
          'test/spec/**/*.js',
         ],
        tasks: ['karma:unit:run'],
      }
    },
  },
}
