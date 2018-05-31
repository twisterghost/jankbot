/**
 * friends - Friend list manager and message interaction module for Jankbot.
 */

const fs = require('fs');
const Steam = require('steam');
const logger = require('./logger.js');
const _ = require('lodash');

let friends = {};
let blacklist = [];
let testMode = false;
let bot;
let config;
let dict;

// Thanks to Dokkat for this function
// http://codereview.stackexchange.com/users/19757/dokkat
/* istanbul ignore next */
function fuzzyMatch(str, pattern) {
  const splitPattern = pattern.split('').reduce((a, b) => `${a}.*${b}`);
  return (new RegExp(splitPattern)).test(str);
}

// Check that a friend exists.
function friendExists(friend) {
  return !!friends[friend];
}

// Load saved friends lists.
/* istanbul ignore next */
if (fs.existsSync('data/friendslist')) {
  friends = JSON.parse(fs.readFileSync('data/friendslist'));
}

// Load saved blacklist.
/* istanbul ignore next */
if (fs.existsSync('data/blacklist')) {
  blacklist = JSON.parse(fs.readFileSync('data/blacklist'));
}

// Initialize this module with a bot instance and config data.
exports.init = function init(botInstance, jankbotConfig, dictionary) {
  bot = botInstance;
  config = jankbotConfig;
  dict = dictionary;
};

// Returns the name of the given ID based on friends list.
exports.nameOf = function nameOf(id) {
  return _.get(friends, [id, 'name'], 'Someone');
};

// Returns the ID of a friend based on the given name.
// Returns undefined if that friend is not found.
exports.idOf = function idOf(name, fuzzy) {
  const fuzzyFriends = Object.keys(friends);
  // Fuzzy search.
  if (fuzzy) {
    for (let i = 0; i < fuzzyFriends.length; i += 1) {
      const fuzzyFriend = fuzzyFriends[i];
      if (friends[fuzzyFriend].name) {
        const thisFriend = friends[fuzzyFriend].name;

        // If this fuzzily matched, get info.
        if (fuzzyMatch(thisFriend.toLowerCase(), name.toLowerCase())) {
          return fuzzyFriend;
        }
      }
    }

    // No matches, return undefined.
    return undefined;
  }

  // Exact search.

  for (let i = 0; i < fuzzyFriends.length; i += 1) {
    const exactFriend = fuzzyFriends[i];
    if (friends[exactFriend].name === name) {
      return exactFriend;
    }
  }
  return undefined;
};

// Updates the timestamp for the given id.
exports.updateTimestamp = function updateTimestamp(id) {
  exports.set(id, 'lastMessageTime', new Date());
};

// Saves a custom property about a friend. Returns true if it was able to
// successfully save.
exports.set = function set(id, property, value) {
  if (friendExists(id)) {
    friends[id][property] = value;
    exports.save();
    return true;
  }
  return false;
};

// Gets a custom property about a friend. Returns undefined if that property
// does not exist.
exports.get = function get(id, property) {
  if (friendExists(id)) {
    return friends[id][property];
  }
  return undefined;
};

// Run callback for each friend, passing in the friend ID.
exports.forEach = function forEach(callback) {
  _.forEach(friends, (value, friend) => callback(friend));
};

// Add a user ID to the blacklist.
exports.blacklist = function blacklistUser(id) {
  if (blacklist.indexOf(id) === -1) {
    blacklist.push(id);
  }
  exports.save();
};

// Removes the given ID from the blacklist.
exports.unBlacklist = function unBlacklistUser(id) {
  const index = blacklist.indexOf(id);
  if (index !== -1) {
    blacklist.splice(index, 1);
  }
  exports.save();
};

// Returns true if the given id is blacklisted.
exports.checkIsBlacklisted = function checkIsBlacklisted(id) {
  return blacklist.indexOf(id) !== -1;
};

// Attempts to add someone to internal friends list.
exports.addFriend = function addFriend(source) {
  if (!friendExists(source)) {
    logger.log(`Adding friend: ${source}`);
    friends[source] = {};
    friends[source].lastMessageTime = new Date();
    friends[source].mute = false;
    exports.save();
  }
};

// Remove a friend from internal memory.
exports.removeFriend = function removeFriend(id, cb) {
  if (friendExists(id)) {
    logger.log(`Unfriending: ${id}`);
    delete friends[id];
    cb(true);
    exports.save();
  } else {
    cb(false);
  }
};

// Update a friend's name
exports.updateFriendName = function updateFriendName(steamId, username) {
  if (steamId !== null) {
    exports.set(steamId, 'name', username);
    exports.save();
  }
};

// Return all friends.
exports.getAllFriends = function getAllFriends() {
  return friends;
};

// Return the blacklist.
exports.getBlacklist = function getBlacklist() {
  return blacklist;
};

// Get if the friend is muted or not.
exports.getMute = function getMute(friend) {
  if (friendExists(friend)) {
    return friends[friend].mute;
  }
  return false;
};

// Set the mute status for a friend to true or false.
exports.setMute = function setMute(friend, mute) {
  if (friendExists(friend)) {
    friends[friend].mute = mute;
  }
  exports.save();
};

// Return true if the given friend ID is listed as an admin.
exports.isAdmin = function isAdmin(friend) {
  if (!config.admins) {
    return false;
  }
  return config.admins.indexOf(friend) !== -1;
};

// Saves the friends list.
/* istanbul ignore next */
exports.save = function save() {
  if (!testMode) {
    fs.writeFileSync('data/friendslist', JSON.stringify(friends));
    fs.writeFileSync('data/blacklist', JSON.stringify(blacklist));
  }
};

// Sends a message to a user.
exports.messageUser = function messageUser(user, message, broadcast) {
  // If this isn't a broadcast, send it to the user.
  if (!broadcast) {
    logger.log(`Message sent to ${exports.nameOf(user)}: ${message}`);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);


  // Otherwise, only send it to them if they aren't muted.
  } else if (!exports.getMute(user)) {
    logger.log(`Message sent to ${exports.nameOf(user)}: ${message}`);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
  }
};

// Broadcasts a message to everyone but source.
exports.broadcast = function broadcast(source, message) {
  logger.log(`Broadcasting: ${message}`);

  const lastBroadcastTime = parseInt(exports.get(source, 'lastBroadcastTime'), 10);
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = new Date().getTime();

  // If they have broadcasted before and it is too soon, stop it.
  // Ignore for admins.
  if (!exports.isAdmin(source) &&
      lastBroadcastTime &&
      (now - TEN_MINUTES) < lastBroadcastTime) {
    exports.messageUser(source, dict.ERRORS.err_cant_broadcast);
    return false;
  }

  // Save this last broadcast time.
  exports.set(source, 'lastBroadcastTime', now);

  _.forEach(friends, (value, friend) => {
    if (friend !== source) {
      exports.messageUser(friend, message, true);
    }
  });

  return true;
};

exports.count = function countFriends() {
  return Object.keys(friends).length;
};

// TODO: Replace this with something better to make tests more blackboxy
// Load mock data for testing and block saving.
exports.initTest = function initTest(friendData) {
  testMode = true;
  blacklist = [];
  friends = friendData;
};

