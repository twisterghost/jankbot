module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    compress: {
      main: {
        options: {
          archive: 'jankbot.zip',
        },
        files: [
          { src: ['jankbot.js'] },
          { src: ['README.md'] },
          { src: ['package.json'] },
          { src: ['dict/*'] },
          { src: ['core/*'] },
          { src: ['scripts/*'] },
          { src: ['lib/*'] },
        ],
      },
    },

    clean: {
      all: [
        'coverage',
        'output.log',
        'npm-debug.log',
        'jankbot.zip',
      ],
    },
  });

  grunt.registerTask('build', [
    'jshint',
  ]);

  grunt.registerTask('release', [
    'compress',
  ]);
};

