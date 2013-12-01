module.exports = {
  load: ['grunt-karma'],
  
  config: {
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true,
      }
    }
  }
}
