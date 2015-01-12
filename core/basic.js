// Handler for basic functionality.
var friends = require('./friends.js');
var minimap = require('minimap');
var DICT;
var helpFunction;

exports.init = function(dictionary, help) {
  DICT = dictionary;
  helpFunction = help;
};

exports.command = function(source, input, original) {

  var command = input[0];
  var fromUser = friends.nameOf(source);

  // Respond to greetings.
  if (isGreeting(original)) {
    var responseStr = minimap.map({'user' : fromUser}, DICT.greeting_response);
    friends.messageUser(source, responseStr);
    return true;
  }

  switch(command) {
    case DICT.CMDS.lfg:
      actions.lfg(source, fromUser);
      return true;
    case DICT.CMDS.inhouse:
     actions.inhouse(source, fromUser);
     return true;
    case DICT.CMDS.ping:
      actions.ping(source);
      return true;
    case DICT.CMDS.help:
      actions.help(source);
      return true;
    case DICT.CMDS.mute:
      actions.mute(source);
      return true;
    case DICT.CMDS.unmute:
      actions.unmute(source);
      return true;
    default:
      return false;
  }

};

var actions = {

  lfg: function(source, fromUser) {
    var lfgMessage = minimap.map({'user' : fromUser},
        DICT.LFG_RESPONSES.lfg_broadcast);
    friends.broadcast(lfgMessage, source);
    friends.messageUser(source, DICT.LFG_RESPONSES.lfg_response_sender);
  },

  inhouse: function(source, fromUser) {
    var inhouseMessage = minimap.map({'host' : fromUser},
        DICT.INHOUSE_RESPONSES.inhouse_broadcast);
    friends.broadcast(inhouseMessage, source);
    friends.messageUser(source, DICT.INHOUSE_RESPONSES.inhouse_response_sender);
  },

  ping: function(source) {
    var responseStr = minimap.map({'userid' : source}, DICT.ping_response);
    friends.messageUser(source, responseStr);
  },

  help: function(source) {
    friends.messageUser(source, helpFunction());
  },

  mute: function(source) {
    friends.messageUser(source, DICT.mute_response);
    friends.setMute(source, true);
  },

  unmute: function(source) {
    friends.setMute(source, false);
    friends.messageUser(source, DICT.unmute_response);
  }

};

function isGreeting(message) {
  return DICT.greetings.indexOf(message) !== -1;
}
