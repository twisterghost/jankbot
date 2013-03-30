// Imports
var fs = require('fs');
var Steam = require('steam');
var logger = require('winston');
var friends = require('./friends.js');
var quotes = require('./quotes.js');
var logger = require('./logger.js');
var argv = require('optimist')

    .default('name', 'Jankbot')
    .argv;

// Constants.
var JANK_GROUP_ID = "103582791432915713";
var ADMINS = [
  "76561197996182292"
];


// Global variables.
var myName = argv.name;


// Log in and set name.
var bot = new Steam.SteamClient();
bot.logOn('thejankbot', 'get in the jank');
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
        messageUser(source, resp);
      });
    } else {
      messageUser(source, "You're not an admin!");
    }
  }

  // Looking for group / general play.
  else if (message == "looking for group" || message == "lfg") {
    broadcast(friends.nameOf(source) + " is looking to play.", source);
    messageUser(source, "I alerted the jank that you wish to play.");
  }

  // Starting inhouses.
  else if (message == "inhouse") {
    broadcast(friends.nameOf(source) + " is hosting an inhouse.", source);
    messageUser(source, "I alerted the jank that you want to have an inhouse.");
  }

  // Slots open alert.
  else if ((input[1] == "slots" && input[2] == "open") || (input[1] == "open" && input[2] == "slots")) {
    var open = input[0];
    broadcast(friends.nameOf(source) + "'s party has " + open + " slots.", source);
    messageUser(source, "I alerted the jank that your group has " + open + " slots open.");
  }

  // Respond to pings.
  else if (message == 'ping') {
    messageUser(source, 'pong: ' + source);
  }

  // Help message.
  else if (message == 'help' || message == 'hlep' || message == 'halp') {
    messageUser(source, help());
  }

  // Mute.
  else if (message == 'mute') {
    messageUser(source, "Okay, I will store messages to you until you unmute me. Bye!");
    friends[source].mute = true;
  }

  // Unmute player and give missed messaged.
  else if (message == 'unmute') {
    friends[source].mute = false;
    messageUser(source, "Hello again, " + friends.nameOf(source) + "!");
    messageUser(source, "Here are the messages you missed:\n" + getHeldMessages(source));
  }

  // Respond to greetings.
  else if (isGreeting(message)) {
    messageUser(source, "Hello there, " + friends.nameOf(source) + ".");
  }

  // Hook for quotes.
  else if (input[0] == "quote") {
    quotes.handleQuotes(original, source, bot);
  }

  // Default.
  else {
    messageUser(source, randomResponse());
  }
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


function messageUser(user, message) {
  if (!friends.getMute(user)) {
    logger.log("Message sent to " + friends.nameOf(user) +  ": " + message);
    bot.sendMessage(user, message, Steam.EChatEntryType.ChatMsg);
  } else {
    friends.pushMessageQueue(user, message);
  }
}


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


// Broadcasts a message to everyone but source.
function broadcast(message, source) {
  logger.log("Broadcasting: " + message);
  for (var friend in friends.getAllFriends()) {
    if (friend != source)
      messageUser(friend, message);
  }
}


// Saves data and exits gracefully.
function shutdown() {
  friends.save();
  quotes.save();
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
  return "I am Jankbot, here to help with your everyday janking!\n" +
  "Some commands:\n" +
  "inhouse - Alert the jank that an inhouse is starting.\n" +
  "looking for group (or lfg) - Alert the jank that you want to play.\n" +
  "X slots open - Alert that you have X slots open in your group.\n" +
  "quote add _____ - Adds a quote to the quote list.\n" +
  "quote list - Lists all quotes\n" +
  "quote random - Gives a random quote\n" +
  "mute - Silences me. I will save missed messages for you.\n" +
  "unmute - Unsilences me. I will tell you what you missed.";
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


