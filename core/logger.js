/**
 * logger - A simple logger middleman for Jankbot. Logs to the console and to a file.
 */

var fs = require('fs');

exports.log = function(message) {
  fs.appendFile('output.log', "LOG: " + message + "\n");
  console.log(message);
};

exports.error = function(message) {
  fs.appendFile('output.log', "ERR: " + message + "\n");
  console.log(message);
};
