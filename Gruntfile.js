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
    },

    compress: {
      main: {
        options: {
          archive: 'jankbot.zip'
        },
        files: [
          {src: ['config.js']},
          {src: ['jankbot.js']},
          {src: ['package.json']},
          {src: ['dict/*']},
          {src: ['core/*']},
          {src: ['install']},
          {src: ['jankbot']},
          {src: ['config']},
          {src: ['scripts/*']}
        ]
      }
    }
  });

  grunt.registerTask('build', [
    'jshint'
  ]);

  grunt.registerTask('release', [
    'compress'
  ]);
};

