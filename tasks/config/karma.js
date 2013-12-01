module.exports = {
  load: ['grunt-karma'],
  
  config: {
    unit: {
      configFile: 'karma.conf.js',
      background: true,
    }
  }
}
