/* eslint no-console: 0 */

/**
 * logger - A lightweight logger that allows logging to stdout and a file simultaneously.
 */

const fs = require('fs');

exports.log = function log(message) {
  fs.appendFileSync('output.log', `LOG: ${message}\n`);
  console.log(message);
};

exports.error = function error(message) {
  fs.appendFileSync('error.log', `ERR: ${message}\n`);
  console.error(message);
};

