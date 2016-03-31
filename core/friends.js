'use strict';

/**
 * friends - Friend list manager and message interaction module for Jankbot.
 */

let fs = require('fs');
let Steam = require('steam');
let logger = require('./logger.js');

let friends = {};
let blacklist = [];
let testMode = false;
let bot;
let config;
let dict;

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
exports.init = function(botInstance, jankbotConfig, dictionary) {
  bot = botInstance;
  config = jankbotConfig;
  dict = dictionary;
};

// Returns the name of the given ID based on friends list.
exports.nameOf = function(id) {
  if (friends.hasOwnProperty(id)) {
    return friends[id].name;
  } else {
    return 'Someone';
  }
};

// Returns the ID of a friend based on the given name.
// Returns undefined if that friend is not found.
exports.idOf = function(name, fuzzy) {

  // Fuzzy search.
  if (fuzzy) {
    for (let fuzzyFriend in friends) {
      if (friends[fuzzyFriend].name) {
        let thisFriend = friends[fuzzyFriend].name;

        // If this fuzzily matched, get info.
        if (fuzzyMatch(thisFriend.toLowerCase(), name.toLowerCase())) {
          return fuzzyFriend;
        }
      }
    }

    // No matches, return undefined.
    return undefined;
  } else {

    // Exact search.
    for (let exactFriend in friends) {
      if (friends[exactFriend].name === name) {
        return exactFriend;
      }
    }
    return undefined;
  }
};

// Updates the timestamp for the given id.
exports.updateTimestamp = function(id) {
  exports.set(id, 'lastMessageTime', new Date());
};

// Saves a custom property about a friend. Returns true if it was able to
// successfully save.
exports.set = function(id, property, value) {
  if (friends.hasOwnProperty(id)) {
    friends[id][property] = value;
    exports.save();
    return true;
  } else {
    return false;
  }
};

// Gets a custom property about a friend. Returns undefined if that property
// does not exist.
exports.get = function(id, property) {
  if (friends.hasOwnProperty(id)) {
    return friends[id][property];
  } else {
    return undefined;
  }
};

// Run callback for each friend, passing in the friend ID.
exports.forEach = function(callback) {
  for (let friend in friends) {
    if (friends.hasOwnProperty(friend)) {
      callback(friend);
    }
  }
};

// Add a user ID to the blacklist.
exports.blacklist = function(id) {
  if (blacklist.indexOf(id) === -1) {
    blacklist.push(id);
  }
  exports.save();
};

// Removes the given ID from the blacklist.
exports.unBlacklist = function(id) {
  let index = blacklist.indexOf(id);
  if (index !== -1) {
    blacklist.splice(index, 1);
  }
  exports.save();
};

// Returns true if the given id is blacklisted.
exports.checkIsBlacklisted = function(id) {
  return blacklist.indexOf(id) !== -1;
};

// Attempts to add someone to internal friends list.
exports.addFriend = function(source) {
  if (!friends.hasOwnProperty(source)) {
    logger.log('Adding friend: ' + source);
    friends[source] = {};
    friends[source].lastMessageTime = new Date();
    friends[source].mute = false;
    exports.save();
  }
};

// Remove a friend from internal memory.
exports.removeFriend = function(id, cb) {
  if (friends.hasOwnProperty(id)) {
    logger.log('Unfriending: ' + id);
    delete friends[id];
    cb(true);
    exports.save();
  } else {
    cb(false);
  }
};

// Update a friend's name
exports.updateFriendName = function(steamId, username) {
  if (steamId !== null) {
    exports.set(steamId,'name', username);
    exports.save();
  }
};

// Return all friends.
exports.getAllFriends = function() {
  return friends;
};

// Return the blacklist.
exports.getBlacklist = function() {
  return blacklist;
};

// Get if the friend is muted or not.
exports.getMute = function(friend) {
  if (friendExists(friend)) {
    return friends[friend].mute;
  } else {
    return false;
  }
};

// Set the mute status for a friend to true or false.
exports.setMute = function(friend, mute) {
  if (friendExists(friend)) {
    friends[friend].mute = mute;
  }
  exports.save();
};

// Return true if the given friend ID is listed as an admin.
exports.isAdmin = function(friend) {
  if (!config.admins) {
    return false;
  }
  return config.admins.indexOf(friend) !== -1;
};

// Check that a friend exists.
function friendExists(friend) {
  return friends.hasOwnProperty(friend);
}

// Saves the friends list.
/* istanbul ignore next */
exports.save = function() {
  if (!testMode) {
    fs.writeFileSync('data/friendslist', JSON.stringify(friends));
    fs.writeFileSync('data/blacklist', JSON.stringify(blacklist));
  }
};

// Sends a message to a user.
exports.messageUser = function(user, message, broadcast) {

  // If this isn't a broadcast, send it to the user.
  if (!broadcast) {
    logger.log('Message sent to ' + exports.nameOf(user) +  ': ' + message);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
    return;

  // Otherwise, only send it to them if they aren't muted.
  } else if (!exports.getMute(user)) {
    logger.log('Message sent to ' + exports.nameOf(user) +  ': ' + message);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
  }
};

// Broadcasts a message to everyone but source.
exports.broadcast = function(source, message) {
  logger.log('Broadcasting: ' + message);

  let lastBroadcastTime = parseInt(exports.get(source, 'lastBroadcastTime'));
  let TEN_MINUTES = 10 * 60 * 1000;
  let now = new Date().getTime();

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

  for (let friend in friends) {
    if (friends.hasOwnProperty(friend) && friend !== source) {
      exports.messageUser(friend, message, true);
    }
  }

  return true;
};

exports.count = function() {
  let count = 0;
  exports.forEach(function() {
    count++;
  });
  return count;
};

// Load mock data for testing and block saving.
exports.initTest = function(friendData) {
  testMode = true;
  blacklist = [];
  friends = friendData;
};

// Thanks to Dokkat for this function
// http://codereview.stackexchange.com/users/19757/dokkat
/* istanbul ignore next */
function fuzzyMatch(str,pattern){
  pattern = pattern.split('').reduce(function(a,b){ return a+'.*'+b; });
  return (new RegExp(pattern)).test(str);
}
