/* eslint no-console: 0 */

/**
 * logger - A simple logger middleman for Jankbot. Logs to the console and to a file.
 */

const fs = require('fs');

/* eslint-disable-next-line */
let noiseFree = false;

exports.log = function log(message) {
  fs.appendFile('output.log', `LOG: ${message}\n`);

  /* istanbul ignore next */
  if (!noiseFree) {
    console.log(message);
  }
};

exports.error = function error(message) {
  fs.appendFile('output.log', `ERR: ${message}\n`);

  /* istanbul ignore next */
  if (!noiseFree) {
    console.log(message);
  }
};

// TODO: Remove this in the next major version
// It's only used in tests and the tests shoudl just be mocking logger and reloading it
exports.noiseFree = function setNoiseFree() {
  noiseFree = true;
};
