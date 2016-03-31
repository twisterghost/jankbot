'use strict';

/**
 * logger - A simple logger middleman for Jankbot. Logs to the console and to a file.
 */

let fs = require('fs');
let noiseFree = false;

exports.log = function(message) {
  fs.appendFile('output.log', 'LOG: ' + message + '\n');

  /* istanbul ignore next */
  if (!noiseFree) {
    console.log(message);
  }
};

exports.error = function(message) {
  fs.appendFile('output.log', 'ERR: ' + message + '\n');

  /* istanbul ignore next */
  if (!noiseFree) {
    console.log(message);
  }
};

exports.noiseFree = function() {
  noiseFree = true;
};
