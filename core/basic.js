'use strict';

// Handler for basic functionality.
let minimap = require('minimap');
let friends = require('./friends.js');
let DICT;
let helpFunction;

exports.init = function(dictionary, help) {
  DICT = dictionary;
  helpFunction = help;
};

exports.command = function(source, input, original) {

  let command = input[0];
  let fromUser = friends.nameOf(source);

  // Respond to greetings.
  if (isGreeting(original)) {
    let responseStr = minimap.map({'user' : fromUser}, DICT.greeting_response);
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

let actions = {

  lfg: function(source, fromUser) {
    let lfgMessage = minimap.map({'user' : fromUser, url: getProfileUrl(source)},
        DICT.LFG_RESPONSES.lfg_broadcast);
    let res = friends.broadcast(source, lfgMessage);
    if (res) {
      friends.messageUser(source, DICT.LFG_RESPONSES.lfg_response_sender);
    }
  },

  inhouse: function(source, fromUser, input) {
    let inhouseMessage;
    if (input.length > 1) {
      input.splice(0, 1);
      let password = input.join(' ');
      inhouseMessage = minimap.map({
        'host' : fromUser,
        'pass': password,
        'url': getProfileUrl(source)
      }, DICT.INHOUSE_RESPONSES.inhouse_broadcast_password);
    } else {
      inhouseMessage = minimap.map({'host' : fromUser, url: getProfileUrl(source)},
          DICT.INHOUSE_RESPONSES.inhouse_broadcast);
    }
    let res = friends.broadcast(source, inhouseMessage);
    if (res) {
      friends.messageUser(source, DICT.INHOUSE_RESPONSES.inhouse_response_sender);
    }
  },

  ping: function(source) {
    let responseStr = minimap.map({'userid' : source}, DICT.ping_response);
    friends.messageUser(source, responseStr);
  },

  help: function(source) {
    let isAdmin = friends.isAdmin(source);
    friends.messageUser(source, helpFunction(isAdmin));
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

    let lookupID = friends.idOf(input, true);

    if (lookupID) {
      let friendsList = friends.getAllFriends();
      let foundFriend = friendsList[lookupID];
      let profileURL = getProfileUrl(lookupID);
      let friendInfo = foundFriend.name + ': \n' +
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
