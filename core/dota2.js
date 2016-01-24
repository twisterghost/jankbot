var logger = require('./logger.js');
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

    dota2.on('ready', function() {
      logger.log('Dota2 is ready to do things.');
    });

    dota2.on('partyInviteUpdate', function(party) {
      var partyId = party.group_id;
      dota2.respondPartyInvite(partyId, true);
      dota2.joinChat(partyId);
    });

    dota2.on('chatMessage', function(channel, senderName, message) {
      // TODO: Allow jankbot functionality in chat messages
      logger.log('[messaged receieved] ' + senderName +  ': ' + message + '. On ' + channel);
    });
  }
};

exports.gg = function() {
  if (inGame) {
    dota2.exit();
    inGame = false;
  }
};

exports.client = dota2;
