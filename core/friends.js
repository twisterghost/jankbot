var fs = require('fs');
var logger = require('./logger.js');
var Steam = require('steam');
var friends = {};
var testMode = false;


// Load saved friends lists.
if (fs.existsSync('friendslist')) {
  friends = JSON.parse(fs.readFileSync('friendslist'));
}


// Returns the name of the given ID based on friends list.
exports.nameOf = function(id) {
  if (friends.hasOwnProperty(id)) {
    return friends[id].name;
  } else {
    return "Someone";
  }
}


// Returns the ID of a friend based on the given name.
// Returns undefined if that friend is not found.
exports.idOf = function(name, fuzzy) {

  // Fuzzy search.
  if (fuzzy) {
    for (var friend in friends) {
      var thisFriend = friends[friend].name;

      // If this fuzzily matched, get info.
      if (fuzzyMatch(thisFriend.toLowerCase(), name.toLowerCase())) {
        return friend;
      }
    }

    // No matches, return undefined.
    return undefined;
  } else {

    // Exact search.
    for (var friend in friends) {
      if (friends[friend].name == name) {
        return friend;
      }
    }
    return undefined;
  }
}


// Updates the timestamp for the given id.
exports.updateTimestamp = function(id) {
  if (friends.hasOwnProperty(id)) {
    friends[id].lastMessageTime = new Date();
  }
}


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
}


// Gets a custom property about a friend. Returns undefined if that property
// does not exist.
exports.get = function(id, property) {
  if (friends.hasOwnProperty(id)) {
    return friends[id][property];
  } else {
    return undefined;
  }
}


// Attempts to add someone to internal friends list.
exports.addFriend = function(source) {
  if (!friends.hasOwnProperty(source)) {
    logger.log("Adding friend: " + source);
    friends[source] = {};
    friends[source].lastMessageTime = new Date();
    friends[source].mute = false;
    exports.save();
  }
}

exports.removeFriend = function(id, cb) {
  if (friends.hasOwnProperty(id)) {
    logger.log('Unfriending: ' + id);
    delete friends[id];
    cb(true);
    exports.save();
  } else {
    cb(false);
  }
}

// Grabs what names it can from bot.users and applies them to the friends list.
exports.updateFriendsNames = function(bot) {
  for (var friend in friends) {
    if (bot.users.hasOwnProperty(friend)) {
      friends[friend].name = bot.users[friend].playerName;
    }
  }
  exports.save();
}


// Return all friends.
exports.getAllFriends = function() {
  return friends;
}


// Get if the friend is muted or not.
exports.getMute = function(friend) {
  if (friendExists(friend)) {
    return friends[friend].mute;
  } else {
    return false;
  }
}


exports.setMute = function(friend, mute) {
  if (friendExists(friend)) {
    friends[friend].mute = mute;
  }
  exports.save();
}


// Check that a friend exists.
function friendExists(friend) {
  return friends.hasOwnProperty(friend);
}


// Saves the friends list.
exports.save = function() {
  if (!testMode) {
    fs.writeFileSync("friendslist", JSON.stringify(friends));
  }
}


// Sends a message to a user.
exports.messageUser = function(user, message, bot, broadcast) {

  // If this isn't a broadcast, send it to the user.
  if (!broadcast) {
    logger.log("Message sent to " + exports.nameOf(user) +  ": " + message);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
    return;

  // Otherwise, only send it to them if they aren't muted.
  } else if (!exports.getMute(user)) {
    logger.log("Message sent to " + exports.nameOf(user) +  ": " + message);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
  }
}


// Broadcasts a message to everyone but source.
exports.broadcast = function(message, source, bot) {
  logger.log("Broadcasting: " + message);
  for (var friend in friends) {
    if (friend != source)
      exports.messageUser(friend, message, bot, true);
  }
}

// Load mock data for testing and block saving.
exports.initTest = function() {
  testMode = true;
  friends = {
    "1": {
      "messages":[],
      "mute":false,
      "name":"Test Friend 1",
      "lastMessageTime": new Date()
    },
    "2": {
      "messages":[],
      "mute":false,
      "name":"Test Friend 2",
      "lastMessageTime": new Date() - 1000
    },
    "3": {
      "messages":[],
      "mute":false,
      "name":"Final Test Friend",
      "lastMessageTime": new Date()
    }
  }
}

// Thanks to Dokkat for this function
// http://codereview.stackexchange.com/users/19757/dokkat
function fuzzyMatch(str,pattern){
    pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
    return (new RegExp(pattern)).test(str);
};
