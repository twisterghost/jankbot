// Imports
var fs = require('fs');
var Steam = require('steam');
var argv = require('optimist')
    .default('name', 'Jankbot')
    .argv;

// Constants.
var JANK_GROUP_ID = "103582791432915713";
var ADMINS = [
  "76561197996182292"
]

// Global variables.
var myName = argv.name;
var friends = {};

// if we've saved a server list, use it
if (fs.existsSync('servers')) {
  Steam.servers = JSON.parse(fs.readFileSync('servers'));
}

// if we've saved a friends list, use it
if (fs.existsSync('friends')) {
  friends = JSON.parse(fs.readFileSync('friends'));
}


// Log in and set name.
var bot = new Steam.SteamClient();
bot.logOn('thejankbot', 'get in the jank');
bot.on('loggedOn', function() {
  console.log('Logged in!');
  bot.setPersonaState(Steam.EPersonaState.Online);
  bot.setPersonaName(myName);

  // Join group chat if told to
  if (argv.groupchat) {
    bot.joinChat(JANK_GROUP_ID);
  }
});


// Respond to messages.
bot.on('message', function(source, message, type, chatter) {
  updateFriendsNames();
  if (message == '') {
    return;
  }
  message = message.toLowerCase();

  addFriend(source);

  console.log('Received message from ' + nameOf(source) + ': ' + message);


  input = message.split(" ");

  if (input[0] == "admin") {

    // Authenticate as admin.
    if (isAdmin(source)) {
      admin(input, function(resp) {
        bot.sendMessage(source, resp, Steam.EChatEntryType.ChatMsg);
      });
    } else {
      bot.sendMessage(source, "You're not an admin!", Steam.EChatEntryType.ChatMsg);
    }
  }

  // Looking for group / general play.
  else if (message == "looking for group" || message == "lfg") {
    broadcast(nameOf(source) + " is looking to play.", source);
    bot.sendMessage(source, "I alerted the jank that you wish to play.", Steam.EChatEntryType.ChatMsg);
  }

  // Starting inhouses.
  else if (message == "inhouse") {
    broadcast(nameOf(source) + " is hosting an inhouse.", source);
    bot.sendMessage(source, "I alerted the jank that you want to have an inhouse.", Steam.EChatEntryType.ChatMsg);
  }

  else if ((input[1] == "slots" && input[2] == "open") || (input[1] == "open" && input[2] == "slots")) {
    var open = input[0];
    broadcast(nameOf(source) + "'s party has " + open + " slots.", source);
    bot.sendMessage(source, "I alerted the jank that your group has " + open + " slots open.", Steam.EChatEntryType.ChatMsg);
  }

  else if (message == 'ping') {
    bot.sendMessage(source, 'pong: ' + source, Steam.EChatEntryType.ChatMsg);
  }

  // Help message
  else if (message == 'help' || message == 'hlep' || message == 'halp') {
    bot.sendMessage(source, help(), Steam.EChatEntryType.ChatMsg);
  }

  else if (isGreeting(message)) {
    bot.sendMessage(source, "Hello there, " + nameOf(source) + ".", Steam.EChatEntryType.ChatMsg);
  }

  // Default.
  else {
    bot.sendMessage(source, randomResponse(), Steam.EChatEntryType.ChatMsg);
  }
});


// Add friends automatically.
bot.on('relationship', function(other, type){
  if(type == Steam.EFriendRelationship.PendingInvitee) {
    bot.addFriend(other);
    console.log("Added friend: " + other);
    addFriend(other);
  }
});

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
    "SPEAK. ENGLISH.",
    "Perhaps try 'help'?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function nameOf(id) {
  return friends[id].name;
}

function broadcast(message, source) {
  for (var friend in friends) {
    if (friend != source)
      bot.sendMessage(friend, message, Steam.EChatEntryType.ChatMsg);
  }
}

function shutdown() {
  fs.writeFileSync("friends", JSON.stringify(friends));
  process.exit();
}

function admin(input, callback) {

  // Quit function
  if (input[1] == "quit") {
    callback("Okay. Quitting...");
    shutdown();
  }

  // Dump friends info.
  if (input[1] == "dump" && input[2] == "friends") {
    console.log(JSON.stringify(friends));
    callback("Friends JSON dumped to console.");
  }

  // Dump users info.
  if (input[1] == "dump" && input[2] == "users") {
    console.log(JSON.stringify(bot.users));
    callback("bot.users JSON dumped to console.");
  }
}

function isAdmin(source) {
  return ADMINS.indexOf(source) != -1;
}

function addFriend(source) {
  if (!friends.hasOwnProperty(source)) {
    console.log("Adding friend: " + source);
    friends[source] = {};
  }
  updateFriendsNames();
}

function updateFriendsNames() {
  for (var friend in friends) {
    friends[friend].name = bot.users[friend].playerName;
  }
}

function help() {
  return "I am Jankbot, here to help with your everyday janking!\n" +
  "Some commands:\n" +
  "inhouse - Alert the jank that an inhouse is starting.\n" +
  "looking for group (or lfg) - Alert the jank that you want to play.\n" +
  "X slots open - Alert that you have X slots open in your group.";
}

function isGreeting(message) {
  var greetings = [
    "hey",
    "sup",
    "hello",
    "hola",
    "yo",
    "howdy"
  ];
  return greetings.indexOf(message) != -1;
}
