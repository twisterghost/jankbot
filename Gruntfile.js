module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },

      all: {
        files: [{
          expand: true,
          cwd: '.',
          src: [
            'jankbot.js',
            'config.js',
            'core/*.js',
            'test/*.js'
          ]
        }]
      }
    }
  });
};
