// Handler for basic functionality.
var minimap = require('minimap');
var friends = require('./friends.js');
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
     actions.inhouse(source, fromUser, input);
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
    case DICT.CMDS.whois:
      actions.whois(source, input);
      return true;
    default:
      return false;
  }

};

var actions = {

  lfg: function(source, fromUser) {
    var lfgMessage = minimap.map({'user' : fromUser, url: getProfileUrl(source)},
        DICT.LFG_RESPONSES.lfg_broadcast);
    var res = friends.broadcast(source, lfgMessage);
    if (res) {
      friends.messageUser(source, DICT.LFG_RESPONSES.lfg_response_sender);
    }
  },

  inhouse: function(source, fromUser, input) {
    var inhouseMessage;
    if (input.length > 1) {
      input.splice(0, 1);
      var password = input.join(' ');
      inhouseMessage = minimap.map({
        'host' : fromUser,
        'pass': password,
        'url': getProfileUrl(source)
      }, DICT.INHOUSE_RESPONSES.inhouse_broadcast_password);
    } else {
      inhouseMessage = minimap.map({'host' : fromUser, url: getProfileUrl(source)},
          DICT.INHOUSE_RESPONSES.inhouse_broadcast);
    }
    var res = friends.broadcast(source, inhouseMessage);
    if (res) {
      friends.messageUser(source, DICT.INHOUSE_RESPONSES.inhouse_response_sender);
    }
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
  },

  whois: function(source, input) {
    input.splice(0, 1);
    input = input.join(' ');

    var lookupID = friends.idOf(input, true);

    if (lookupID) {
      var friendsList = friends.getAllFriends();
      var foundFriend = friendsList[lookupID];
      var profileURL = getProfileUrl(lookupID);
      var friendInfo = foundFriend.name + ': \n' +
        'Steam profile: ' + profileURL + '\n';
      friends.messageUser(source, friendInfo);
    } else {

    // No friend found :(
    friends.messageUser(source, 'I couldn\'t find any user I know with a name similar to ' +
      input + '. Sorry :(');

    }
  }

};

function isGreeting(message) {
  return DICT.greetings.indexOf(message) !== -1;
}

function getProfileUrl(source) {
  return 'http://steamcommunity.com/profiles/' + source;
}
