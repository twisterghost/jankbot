const logger = require('./logger.js');
const Dota2 = require('dota2');

let dota2;
let inGame = false;

exports.init = function init(bot) {
  dota2 = new Dota2.Dota2Client(bot, true);
};

exports.launch = function launch() {
  if (!inGame) {
    dota2.launch();
    inGame = true;

    dota2.on('ready', () => {
      logger.log('Dota2 is ready to do things.');
    });
  }
};

exports.gg = function gg() {
  if (inGame) {
    dota2.exit();
    inGame = false;
  }
};

exports.getClient = function getClient() {
  return dota2;
};
