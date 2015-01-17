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
var admin = require('./core/admin.js');
var basic = require('./core/basic.js');
var minimap = require('minimap');

// Ensure data/ exists
if (!fs.existsSync('data')) {
  logger.error('The data directory is missing. Please run ./config to set up Jankbot.');
  process.exit(1);
}

// Load config file.
var CONFIG = JSON.parse(fs.readFileSync(path.join('data', 'config.json')));

// Load dictionary.
var DICT = JSON.parse(fs.readFileSync(path.join('dict/', CONFIG.dictionary)));

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
    fs.readdirSync(path.join(modulesPath, dir)).forEach(function (file) {

      // Load up the modules based on their module.json file.
      if (file === 'module.json') {
        var moduleConfigPath = path.join(modulesPath, dir, file);
        var moduleConfig = JSON.parse(fs.readFileSync(moduleConfigPath));
        logger.log('Loading module ' + moduleConfig.name + ' by ' + moduleConfig.author + '...');
        var module = require(path.join(modulesPath, dir, moduleConfig.main));

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

// Create the bot instance.
var bot = new Steam.SteamClient();

// Attempt to log on to Steam.
bot.logOn({
  accountName: CONFIG.username,
  password: CONFIG.password
});

// Once logged on, configure self and initialize core modules.
bot.on('loggedOn', function() {
  logger.log(DICT.SYSTEM.system_loggedin);

  // Tell Steam our screen name and status.
  bot.setPersonaState(Steam.EPersonaState.Online);
  bot.setPersonaName(CONFIG.displayName);

  // Initialize core modules.
  dota2.init(bot);
  friends.init(bot, CONFIG);
  admin.init(bot, DICT, shutdown);
  basic.init(DICT, help);
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
  logger.log(minimap.map({'user' : fromUser, 'message' : original},
      DICT.SYSTEM.system_msg_received));

  // Create the input variable which we give to modules for parsing.
  var input = message.split(' ');

  // First, check if this is an admin function request.
  if (input[0] === 'admin') {

    // Authenticate as admin.
    if (friends.isAdmin(source)) {
      admin.command(source, input, original);
      return;
    } else {
      friends.messageUser(source, DICT.ERRORS.err_not_admin);
      return;
    }
  }

  // Next, check if it is a default action.
  if (basic.command(source, input, original)) {
    return;
  }

  // Finally, loop through other modules.
  for (var i = 0; i < modules.length; i++) {
    if (typeof modules[i].handle === 'function') {

      // If this module returns true after execution, stop parsing.
      if (modules[i].handle(original, source)) {
        return;
      }
    }
  }

  // If nothing was matched, send a random response back.
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
    logger.log(minimap.map({'userid' : other}, DICT.SYSTEM.system_added_friend));
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

// Help text.
function help() {
  var resp = DICT.help_message + '\n';
  for (var cmd in DICT.CMDS) {
    if (typeof cmd === 'string') {
      resp += cmd + ' - ' + DICT.CMD_HELP[cmd] + '\n';
    }
  }
  for (var i = 0; i < modules.length; i++) {
    if (typeof modules[i].getHelp === 'function') {
      resp += '\n' + modules[i].getHelp();
    }
  }
  return resp;
}
