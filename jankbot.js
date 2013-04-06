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

// Define command line arguments.
var argv = require('optimist');

// Load config file.
var CONFIG = JSON.parse(fs.readFileSync("config.json"));

// Set admins.
var ADMINS = CONFIG.admins;

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
  logger.log('Logged in!');
  bot.setPersonaState(Steam.EPersonaState.Online);
  bot.setPersonaName(myName);

  // Join group chat if told to
  if (argv.groupchat) {
    bot.joinChat(JANK_GROUP_ID);
  }
});


// Respond to messages.
bot.on('message', function(source, message, type, chatter) {
  friends.addFriend(source);
  friends.updateFriendsNames(bot);
  if (message == '') {
    return;
  }
  var original = message;
  message = message.toLowerCase();
  logger.log('Received message from ' + friends.nameOf(source) + ': ' + message);
  input = message.split(" ");

  if (input[0] == "admin") {

    // Authenticate as admin.
    if (isAdmin(source)) {
      admin(input, function(resp) {
        friends.messageUser(source, resp, bot);
      });
      return;
    } else {
      friends.messageUser(source, "You're not an admin!", bot);
      return;
    }
  }

  // Looking for group / general play.
  else if (message == "looking for group" || message == "lfg") {
    friends.broadcast(friends.nameOf(source) + " is looking to play.", source, bot);
    friends.messageUser(source, "I alerted the jank that you wish to play.", bot);
    return;
  }

  // Starting inhouses.
  else if (message == "inhouse") {
    friends.broadcast(friends.nameOf(source) + " is hosting an inhouse.", source, bot);
    friends.messageUser(source, "I alerted the jank that you want to have an inhouse.", bot);
    return;
  }

  // Slots open alert.
  else if ((input[1] == "slots" && input[2] == "open") || (input[1] == "open" && input[2] == "slots")) {
    var open = input[0];

    // Stop carl from being stupid.
    if (open != "1" || open != "2" || open != "3" || open != "4") {
      friends.messageUser(source, "You must give a number between 1 and 4, inclusive.", bot);
    } else {
      friends.broadcast(friends.nameOf(source) + "'s party has " + open + " slots.", source, bot);
      friends.messageUser(source, "I alerted the jank that your group has " + open + " slots open.", bot);
    }
    return;
  }

  // Respond to pings.
  else if (message == 'ping') {
    friends.messageUser(source, 'pong: ' + source, bot);
    return;
  }

  // Help message.
  else if (message == 'help' || message == 'hlep' || message == 'halp') {
    friends.messageUser(source, help(), bot);
    return;
  }

  // Mute.
  else if (message == 'mute' || message == 'shutup' || message == 'shut-up') {
    friends.messageUser(source, "Okay, I will store messages to you until you unmute me. Bye!", bot);
    friends.setMute(source, true);
    return;
  }

  // Unmute player and give missed messaged.
  else if (message == 'unmute') {
    friends.setMute(source, false);
    friends.messageUser(source, "Hello again, " + friends.nameOf(source) + "!", bot);
    friends.messageUser(source, "Here are the messages you missed:\n" + friends.getHeldMessages(source), bot);
    return;
  }

  // Respond to greetings.
  else if (isGreeting(message)) {
    friends.messageUser(source, "Hello there, " + friends.nameOf(source) + ".", bot);
    return;
  }

  // Loop through other modules.
  for (var i = 0; i < modules.length; i++) {
    if (modules[i].canHandle(original)) {
      modules[i].handle(original, source, bot);
      return;
    }
  }

  // Default
  friends.messageUser(source, randomResponse(), bot);

});


// Add friends automatically.
bot.on('relationship', function(other, type){
  if(type == Steam.EFriendRelationship.PendingInvitee) {
    bot.addFriend(other);
    logger.log("Added friend: " + other);
    friends.addFriend(other);
    friends.updateFriendsNames(bot);
  }
});


// Responses for unknown commands.
function randomResponse() {
  var responses = [
    "Come again?",
    "Wuzzat?",
    "Wut",
    "Huh?",
    "Sure.....what?",
    "Not a clue what you want.",
    "Shut up, Richard.",
    "WAT.",
    "Perhaps try 'help'?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}


// Saves data and exits gracefully.
function shutdown() {
  friends.save();
  for (var i = 0; i < modules.length; i++) {
    modules[i].onExit();
  }
  process.exit();
}


// Handler for admin functionality.
function admin(input, callback) {

  // Quit function
  if (input[1] == "quit") {
    callback("Okay. Quitting...");
    shutdown();
  }

  // Dump friends info.
  if (input[1] == "dump" && input[2] == "friends") {
    logger.log(JSON.stringify(friends.getAllFriends()));
    callback("Friends JSON dumped to console.");
  }

  // Dump users info.
  if (input[1] == "dump" && input[2] == "users") {
    logger.log(JSON.stringify(bot.users));
    callback("bot.users JSON dumped to console.");
  }
}


// Returns true if the given ID is an admin.
function isAdmin(source) {
  return ADMINS.indexOf(source) != -1;
}


// Help text.
function help() {
  var resp =  "I am Jankbot, here to help with your everyday janking!\n" +
  "DEFAULT COMMANDS:\n" +
  "inhouse - Alert the jank that an inhouse is starting.\n" +
  "looking for group (or lfg) - Alert the jank that you want to play.\n" +
  "X slots open - Alert that you have X slots open in your group.\n" +
  "mute - Silences me. I will save missed messages for you.\n" +
  "unmute - Unsilences me. I will tell you what you missed.\n";
  for (var i = 0; i < modules.length; i++) {
    resp += "\n" + modules[i].getHelp();
  }
  return resp;
}


function isGreeting(message) {
  var greetings = [
    "hey",
    "sup",
    "hello",
    "hola",
    "yo",
    "howdy",
    "hi"
  ];
  return greetings.indexOf(message) != -1;
}


