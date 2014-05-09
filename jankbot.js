/**
 * Jankbot - A Dota-centric steambot by JankDota
 * Authored by Michael Barrett (twisterghost)
 * https://github.com/twisterghost/jankbot
 */

// Imports.
var fs = require('fs');
var Steam = require('steam');
var friends = require('./bot_modules/friends.js');
var logger = require('./bot_modules/logger.js');
var minimap = require('minimap');

// Define command line arguments.
var argv = require('optimist');

// Load config file.
var CONFIG = JSON.parse(fs.readFileSync("config.json"));

// Load dictionary.
var DICT = JSON.parse(fs.readFileSync('dict/' + CONFIG.dictionary));

// Set admins.
var ADMINS = CONFIG.admins;

if (ADMINS == null) {
  ADMINS = [];
}

// Load modules.
var modules = [];
for (var i = 0; i < CONFIG.modules.length; i++) {
  modules.push(require("./bot_modules/" + CONFIG.modules[i] + ".js"));
}

// Global variables.
var myName = CONFIG.displayName;

// Log in and set name.
var bot = new Steam.SteamClient();
bot.logOn(CONFIG.username, CONFIG.password);
bot.on('loggedOn', function() {
  logger.log(DICT.SYSTEM.system_loggedin);
  bot.setPersonaState(Steam.EPersonaState.Online);
  bot.setPersonaName(myName);
});


// Respond to messages.
bot.on('message', function(source, message, type, chatter) {

  // Be sure this person is remembered and run friends list name update.
  friends.addFriend(source);
  friends.updateFriendsNames(bot);

  // If the message is blank (blank messages are received from 'is typing').
  if (message == '') {
    return;
  }

  // Save the original full message for later use.
  var original = message;
  message = message.toLowerCase();
  var fromUser = friends.nameOf(source);

  // Log the received message.
  logger.log(minimap.map({"user" : fromUser, "message" : original},
      DICT.SYSTEM.system_msg_received));

  var input = message.split(" ");

  // First, check if this is an admin function request.
  if (input[0] == "admin") {

    // Authenticate as admin.
    if (isAdmin(source)) {
      admin(input, source, original, function(resp) {
        friends.messageUser(source, resp, bot);
      });
      return;
    } else {
      friends.messageUser(source, DICT.ERRORS.err_not_admin, bot);
      return;
    }
  }

  // Looking for group / general play.
  else if (message == DICT.CMDS.lfg) {
    var broadcastMsg = minimap.map({"user" : fromUser},
        DICT.LFG_RESPONSES.lfg_broadcast);
    friends.broadcast(broadcastMsg, source, bot);
    friends.messageUser(source, DICT.LFG_RESPONSES.lfg_response_sender, bot);
    return;
  }

  // Starting inhouses.
  else if (message == DICT.CMDS.inhouse) {
    var broadcastMsg = minimap.map({"host" : fromUser},
        DICT.INHOUSE_RESPONSES.inhouse_broadcast);
    friends.broadcast(broadcastMsg, source, bot);
    friends.messageUser(source, DICT.INHOUSE_RESPONSES.inhouse_response_sender, bot);
    return;
  }

  // Respond to pings.
  else if (message == DICT.CMDS.ping) {
    var responseStr = minimap.map({"userid" : source}, DICT.ping_response);
    friends.messageUser(source, responseStr, bot);
    return;
  }

  // Help message.
  else if (message == DICT.CMDS.help) {
    friends.messageUser(source, help(), bot);
    return;
  }

  // Mute.
  else if (message == DICT.CMDS.mute) {
    friends.messageUser(source, DICT.mute_response, bot);
    friends.setMute(source, true);
    return;
  }

  // Unmute player and give missed messaged.
  else if (message == DICT.CMDS.unmute) {
    friends.setMute(source, false);
    var responseStr = minimap.map({"messages" : friends.getHeldMessages(source)},
        DICT.unmute_response);
    friends.messageUser(source, responseStr, bot);
    return;
  }

  // Respond to greetings.
  else if (isGreeting(message)) {
    var responseStr = minimap.map({"user" : fromUser}, DICT.greeting_response);
    friends.messageUser(source, responseStr, bot);
    return;
  }

  // Loop through other modules.
  for (var i = 0; i < modules.length; i++) {
    if (typeof modules[i].canHandle === 'function') {
      if (modules[i].canHandle(original)) {
        modules[i].handle(original, source, bot);
        return;
      }
    }
  }

  // Default
  friends.messageUser(source, randomResponse(), bot);

});


// Add friends automatically.
bot.on('relationship', function(other, type){
  if(type == Steam.EFriendRelationship.PendingInvitee) {
    bot.addFriend(other);
    logger.log(minimap.map({"userid" : other}, DICT.SYSTEM.system_added_friend));
    friends.addFriend(other);
    friends.updateFriendsNames(bot);
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
  if (input[1] == "quit") {
    callback(DICT.ADMIN.quit);
    shutdown();
  }

  // Dump friends info.
  if (input[1] == "dump" && input[2] == "friends") {
    logger.log(JSON.stringify(friends.getAllFriends()));
    callback(DICT.ADMIN.dump_friends);
  }

  // Dump users info.
  if (input[1] == "dump" && input[2] == "users") {
    logger.log(JSON.stringify(bot.users));
    callback(DICT.ADMIN.dump_users);
  }

  if (input[1] == "broadcast") {
    var adminMessage = original.replace("admin broadcast", "");
    logger.log(minimap.map({message: adminMessage}, DICT.ADMIN.broadcast_log));
    friends.broadcast(adminMessage, source, bot);
    callback(DICT.ADMIN.broadcast_sent);

  }
}


// Returns true if the given ID is an admin.
function isAdmin(source) {
  return ADMINS.indexOf(source) != -1;
}


// Help text.
function help() {
  var resp = DICT.help_message + "\n";
  for (cmd in DICT.CMDS) {
    resp += cmd + " - " + DICT.CMD_HELP[cmd] + "\n";
  }
  for (var i = 0; i < modules.length; i++) {
    resp += "\n" + modules[i].getHelp();
  }
  return resp;
}


function isGreeting(message) {
  return DICT.greetings.indexOf(message) != -1;
}