var Dota2 = require('dota2');
var dota2;
var inGame = false;

exports.init = function(bot) {
  dota2 = new Dota2.Dota2Client(bot, true);
};

exports.launch = function() {
  if (!inGame) {
    dota2.launch();
    inGame = true;
  }
};

exports.gg = function() {
  if (inGame) {
    dota2.exit();
    inGame = false;
  }
};

exports.client = dota2;
