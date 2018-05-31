// Handler for basic functionality.
const minimap = require('minimap');
const _ = require('lodash');
const friends = require('./friends.js');

let DICT;
let helpFunction;

function isGreeting(message) {
  return DICT.greetings.indexOf(message) !== -1;
}

function getProfileUrl(source) {
  return `http://steamcommunity.com/profiles/${source}`;
}

const actions = {

  lfg(source, fromUser) {
    const lfgMessage = minimap.map(
      { user: fromUser, url: getProfileUrl(source) },
      DICT.LFG_RESPONSES.lfg_broadcast,
    );
    const res = friends.broadcast(source, lfgMessage);
    if (res) {
      friends.messageUser(source, DICT.LFG_RESPONSES.lfg_response_sender);
    }
  },

  inhouse(source, fromUser, input) {
    let inhouseMessage;
    if (input.length > 1) {
      input.splice(0, 1);
      const password = input.join(' ');
      inhouseMessage = minimap.map({
        host: fromUser,
        pass: password,
        url: getProfileUrl(source),
      }, DICT.INHOUSE_RESPONSES.inhouse_broadcast_password);
    } else {
      inhouseMessage = minimap.map(
        { host: fromUser, url: getProfileUrl(source) },
        DICT.INHOUSE_RESPONSES.inhouse_broadcast,
      );
    }
    const res = friends.broadcast(source, inhouseMessage);
    if (res) {
      friends.messageUser(source, DICT.INHOUSE_RESPONSES.inhouse_response_sender);
    }
  },

  ping(source) {
    const responseStr = minimap.map({ userid: source }, DICT.ping_response);
    friends.messageUser(source, responseStr);
  },

  help(source) {
    const isAdmin = friends.isAdmin(source);
    friends.messageUser(source, helpFunction(isAdmin));
  },

  mute(source) {
    friends.messageUser(source, DICT.mute_response);
    friends.setMute(source, true);
  },

  unmute(source) {
    friends.setMute(source, false);
    friends.messageUser(source, DICT.unmute_response);
  },

  whois(source, rawInput) {
    let input = _.cloneDeep(rawInput);
    input.shift();
    input = input.join(' ');

    const lookupID = friends.idOf(input, true);

    if (lookupID) {
      const friendsList = friends.getAllFriends();
      const foundFriend = friendsList[lookupID];
      const profileURL = getProfileUrl(lookupID);
      const friendInfo = `${foundFriend.name}: \n` +
        `Steam profile: ${profileURL}\n`;
      friends.messageUser(source, friendInfo);
    } else {
      // No friend found :(
      friends.messageUser(source, `I couldn't find any user I know with a name similar to ${
        input}. Sorry :(`);
    }
  },

};

exports.init = function init(dictionary, help) {
  DICT = dictionary;
  helpFunction = help;
};

exports.command = function handleCommand(source, input, original) {
  const command = input[0];
  const fromUser = friends.nameOf(source);

  // Respond to greetings.
  if (isGreeting(original)) {
    const responseStr = minimap.map({ user: fromUser }, DICT.greeting_response);
    friends.messageUser(source, responseStr);
    return true;
  }

  switch (command) {
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

