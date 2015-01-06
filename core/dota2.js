var dota2 = require('dota2');
var Dota2;

exports.init = function(bot) {
  Dota2 = new dota2.Dota2Client(bot, true);
};

exports.client = Dota2;
