var fs = require('fs');
var logger = require('./logger.js');
var Steam = require('steam');

var friends = {};

var MAX_MESSAGE_HOLD = 10;


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
      if (fuzzyMatch(thisFriend, name)) {
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
    friends[source].messages = [];
    friends[source].mute = false;
    exports.save();
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


// Add a message to a friend's message queue.
function pushMessageQueue(friend, message) {
  friends[friend].messages.push(message);
  if (friends[friend].messages.length > MAX_MESSAGE_HOLD) {
    friends[friend].messages.splice(0, friends[friend].messages.length - MAX_MESSAGE_HOLD);
  }
}


// Return all messages from a friends message queue and clear it.
exports.getHeldMessages = function(friend) {
  if (friends[friend].messages.length == 0) {
    return "There were no messages for you while I was muted.";
  } else {
    var resp = "";
    resp = friends[friend].messages.join("\n");
    friends[friend].messages = [];
    return resp;
  }
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
  fs.writeFileSync("friendslist", JSON.stringify(friends));
}


// Sends a message to a user.
exports.messageUser = function(user, message, bot) {
  if (!exports.getMute(user)) {
    logger.log("Message sent to " + exports.nameOf(user) +  ": " + message);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
  } else {
    pushMessageQueue(user, message);
  }
  exports.save();
}


// Broadcasts a message to everyone but source.
exports.broadcast = function(message, source, bot) {
  logger.log("Broadcasting: " + message);
  for (var friend in friends) {
    if (friend != source)
      exports.messageUser(friend, message, bot);
  }
}

// Thanks to Dokkat for this function
// http://codereview.stackexchange.com/users/19757/dokkat
function fuzzyMatch(str,pattern){
    pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
    return (new RegExp(pattern)).test(str);
};
