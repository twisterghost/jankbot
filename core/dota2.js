'use strict';

let logger = require('./logger.js');
let Dota2 = require('dota2');
let dota2;
let inGame = false;

exports.init = function(bot) {
  dota2 = new Dota2.Dota2Client(bot, true);
};

exports.launch = function() {
  if (!inGame) {
    dota2.launch();
    inGame = true;

    dota2.on('ready', function() {
      logger.log('Dota2 is ready to do things.');
    });
  }
};

exports.gg = function() {
  if (inGame) {
    dota2.exit();
    inGame = false;
  }
};

// DEPRECATED - This was broken, but kept for 3.*.* to keep from breaking further
exports.client = dota2;

exports.getClient = function() {
  return dota2;
};
