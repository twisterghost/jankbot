/**
 * Jankbot - A Dota-centric steambot by JankDota
 * Authored by Michael Barrett (@twisterghost)
 * https://github.com/twisterghost/jankbot
 */

// Imports.
var fs = require('fs');
var path = require('path');
var friends = require('./core/friends.js');
var logger = require('./core/logger.js');
var Steam = require('steam');
var dota2 = require('./core/dota2.js');
var minimap = require('minimap');

// Load config file.
var CONFIG = JSON.parse(fs.readFileSync("config.json"));

// Load dictionary.
var DICT = JSON.parse(fs.readFileSync('dict/' + CONFIG.dictionary));

// Set admins.
var ADMINS = CONFIG.admins;

if (ADMINS === null) {
  ADMINS = [];
}

// Load modules.
var modules = [];
var modulesPath = path.join(__dirname, '/bot_modules/');

// If the modules firectory exists, load all modules from it.
if (fs.existsSync(modulesPath)) {
  fs.readdirSync(modulesPath).forEach(function (dir) {
    fs.readdirSync(modulesPath + dir).forEach(function (file) {

      // Load up the modules based on their module.json file.
      if (file === 'module.json') {
        var moduleConfig = JSON.parse(fs.readFileSync(modulesPath + dir + '/' + file));
        logger.log("Loading module " + moduleConfig.name + " by " + moduleConfig.author + "...");
        var module = require(path.join(modulesPath, dir, '/', moduleConfig.main));

        if (module.setDictionary) {
          module.setDictionary(CONFIG.dictionary);
        }

        modules.push(module);
      }
    });
  });
  logger.log('Loaded ' + modules.length + ' module(s).');
} else {
  logger.log('No bot_modules directory found, skipping module import.');
}

// Log in and set name.
var bot = new Steam.SteamClient();

// Attempt to log on to Steam.
bot.logOn({
  accountName: CONFIG.username,
  password: CONFIG.password
});

// Once logged on, configure self and initialize core modules.
bot.on('loggedOn', function() {
  logger.log(DICT.SYSTEM.system_loggedin);
  bot.setPersonaState(Steam.EPersonaState.Online);
  bot.setPersonaName(CONFIG.displayName);
  dota2.init(bot);
  friends.init(bot, CONFIG);
});

// Respond to messages. All core Jankbot functionality starts from this function.
bot.on('message', function(source, message) {

  // Be sure this person is remembered and run friends list name update.
  // friends.addFriend() can be run however many times on the same friend ID without duplicating.
  friends.addFriend(source);
  friends.updateFriendsNames();
  friends.updateTimestamp(source);

  // If the message is blank (blank messages are received from 'is typing').
  if (message === '') {
    return;
  }

  // Save the original full message for later use.
  var original = message;
  message = message.toLowerCase();
  var fromUser = friends.nameOf(source);

  // Log the received message.
  logger.log(minimap.map({"user" : fromUser, "message" : original},
      DICT.SYSTEM.system_msg_received));

  // Create the input variable which we give to modules for parsing.
  var input = message.split(" ");
  var responseStr;

  // First, check if this is an admin function request.
  // TODO: Modularize admin commands.
  if (input[0] === "admin") {

    // Authenticate as admin.
    if (friends.isAdmin(source)) {
      admin(input, source, original, function(resp) {
        friends.messageUser(source, resp);
      });
      return;
    } else {
      friends.messageUser(source, DICT.ERRORS.err_not_admin);
      return;
    }
  }

  // Looking for group / general play.
  else if (message === DICT.CMDS.lfg) {
    var lfgMessage = minimap.map({"user" : fromUser},
        DICT.LFG_RESPONSES.lfg_broadcast);
    friends.broadcast(lfgMessage, source);
    friends.messageUser(source, DICT.LFG_RESPONSES.lfg_response_sender);
    return;
  }

  // Starting inhouses.
  else if (message === DICT.CMDS.inhouse) {
    var inhouseMessage = minimap.map({"host" : fromUser},
        DICT.INHOUSE_RESPONSES.inhouse_broadcast);
    friends.broadcast(inhouseMessage, source);
    friends.messageUser(source, DICT.INHOUSE_RESPONSES.inhouse_response_sender);
    return;
  }

  // Respond to pings.
  else if (message === DICT.CMDS.ping) {
    responseStr = minimap.map({"userid" : source}, DICT.ping_response);
    friends.messageUser(source, responseStr);
    return;
  }

  // Help message.
  else if (message === DICT.CMDS.help) {
    friends.messageUser(source, help());
    return;
  }

  // Mute.
  else if (message === DICT.CMDS.mute) {
    friends.messageUser(source, DICT.mute_response);
    friends.setMute(source, true);
    return;
  }

  // Unmute player and give missed messaged.
  else if (message === DICT.CMDS.unmute) {
    friends.setMute(source, false);
    friends.messageUser(source, DICT.unmute_response);
    return;
  }

  // Respond to greetings.
  else if (isGreeting(message)) {
    responseStr = minimap.map({"user" : fromUser}, DICT.greeting_response);
    friends.messageUser(source, responseStr);
    return;
  }

  // Loop through other modules.
  for (var i = 0; i < modules.length; i++) {
    if (typeof modules[i].handle === 'function') {

      // If this module returns true after execution, stop parsing.
      if (modules[i].handle(original, source)) {
        return;
      }
    }
  }

  // Default
  friends.messageUser(source, randomResponse());

});


// Add friends back automatically if they are not blacklisted.
bot.on('relationship', function(other, type){
  if(type === Steam.EFriendRelationship.PendingInvitee) {
    if (friends.checkIsBlacklisted(other)) {
      logger.log(minimap.map({userid: other}, DICT.SYSTEM.system_blacklist_attempt));
      bot.removeFriend(other);
      return;
    }
    bot.addFriend(other);
    logger.log(minimap.map({"userid" : other}, DICT.SYSTEM.system_added_friend));
    friends.addFriend(other);
    friends.updateFriendsNames();
  }
});

// Responses for unknown commands.
function randomResponse() {
  var responses = DICT.random_responses;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Saves data and exits gracefully.
function shutdown() {
  friends.save();
  for (var i = 0; i < modules.length; i++) {
    if (typeof modules[i].onExit === 'function') {
      modules[i].onExit();
    }
  }
  process.exit();
}

// Handler for admin functionality.
function admin(input, source, original, callback) {

  // Quit function
  if (input[1] === "quit") {
    callback(DICT.ADMIN.quit);
    shutdown();
  }

  // Dump friends info.
  if (input[1] === "dump" && input[2] === "friends") {
    logger.log(JSON.stringify(friends.getAllFriends()));
    callback(DICT.ADMIN.dump_friends);
  }

  // Dump users info.
  if (input[1] === "dump" && input[2] === "users") {
    logger.log(JSON.stringify(bot.users));
    callback(DICT.ADMIN.dump_users);
  }

  // Look up friend ID.
  if (input[1] === "lookup") {
    var lookupList = friends.getAllFriends();
    if (lookupList.hasOwnProperty(input[2])) {
      var friend = lookupList[input[2]];
      callback(JSON.stringify(friend, null, "  "));
    } else {
      callback(DICT.ADMIN.lookup_error);
    }
  }

  // Scan for inactive users.
  if (input[1] === "inactive") {
    var ONE_WEEK = 60 * 60 * 24 * 7 * 1000;
    var inactiveList = friends.getAllFriends();
    var inactiveUsers = [];
    for (var inactiveFriend in inactiveList) {

      // If this user hasn't used this bot in a week, log it.
      if (new Date(inactiveList[inactiveFriend].lastMessageTime).getTime() <
          (new Date().getTime() - ONE_WEEK)) {
        inactiveUsers.push(inactiveList[inactiveFriend]);
      }
    }

    if (inactiveUsers.length === 0) {
      callback(DICT.ADMIN.no_inactive_users);
    } else {
      callback(JSON.stringify(inactiveUsers, null, "  "));
    }
  }

  // Kick friend.
  if (input[1] === "kick") {
    var friendId = input[2];
    bot.removeFriend(input[2]);
    friends.removeFriend(friendId, function(success) {
      if (success) {
        callback(minimap.map({id: friendId}, DICT.ADMIN.remove_friend_success));
      } else {
        callback(minimap.map({id: friendId}, DICT.ADMIN.remove_friend_error));
      }
    });
  }

  // Blacklist an id.
  if (input[1] === "blacklist") {
    friends.blacklist(input[2]);
    callback(DICT.ADMIN.blacklist_add);
  }

  // Unblacklist an id.
  if (input[1] === "unblacklist") {
    friends.unBlacklist(input[2]);
    callback(DICT.ADMIN.blacklist_remove);
  }

  // Add a friend.
  if (input[1] === "add") {
    bot.addFriend(input[2]);
    friends.addFriend(input[2]);
  }

  // Broadcast a message.
  if (input[1] === "broadcast") {
    var adminMessage = original.replace("admin broadcast", "");
    logger.log(minimap.map({message: adminMessage}, DICT.ADMIN.broadcast_log));
    friends.broadcast(adminMessage, source);
    callback(DICT.ADMIN.broadcast_sent);
  }
}

// Help text.
function help() {
  var resp = DICT.help_message + "\n";
  for (var cmd in DICT.CMDS) {
    if (typeof cmd === 'string') {
      resp += cmd + " - " + DICT.CMD_HELP[cmd] + "\n";
    }
  }
  for (var i = 0; i < modules.length; i++) {
    if (typeof modules[i].getHelp === 'function') {
      resp += "\n" + modules[i].getHelp();
    }
  }
  return resp;
}

function isGreeting(message) {
  return DICT.greetings.indexOf(message) !== -1;
}
