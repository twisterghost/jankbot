/**
 * Jankbot - A Dota-centric steambot by JankDota
 * Authored by Michael Barrett (@twisterghost)
 * https://github.com/twisterghost/jankbot
 */

const fs = require('fs');
const path = require('path');
const minimap = require('minimap');
const Steam = require('steam');
const _ = require('lodash');
const friends = require('./core/friends.js');
const logger = require('./core/logger.js');
const dota2 = require('./core/dota2.js');
const admin = require('./core/admin.js');
const basic = require('./core/basic.js');
const ModuleLoader = require('./lib/moduleLoader.js');

// Ensure data/ exists
if (!fs.existsSync('data')) {
  logger.error('The data directory is missing. Type "npm run config" to set up Jankbot.');
  process.exit(1);
}

// Load config file.
const CONFIG = JSON.parse(fs.readFileSync(path.join('data', 'config.json')));

// Load dictionary.
const DICT = JSON.parse(fs.readFileSync(path.join('dict', CONFIG.dictionary)));

// Load in optional helpfile.
let helpInfo = '';
if (fs.existsSync('helpfile')) {
  helpInfo = fs.readFileSync('helpfile');
}

// Load modules.
const moduleLoader = new ModuleLoader();
moduleLoader.addModulePath('node_modules');
moduleLoader.addModulePath('bot_modules');
let modules = [];
try {
  modules = moduleLoader.getModules();
} catch (error) {
  logger.error(error.message);
}

logger.log(`Loaded ${modules.length} modules.`);

// Responses for unknown commands.
function randomResponse() {
  const responses = DICT.random_responses;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Saves data and exits gracefully.
function shutdown() {
  logger.log('Shutting down Jankbot...');
  friends.save();
  for (let i = 0; i < modules.length; i += 1) {
    if (typeof modules[i].onExit === 'function') {
      modules[i].onExit();
    }
  }
  process.exit();
}

// Help text.
function help(isAdmin) {
  let resp = '\n';
  if (helpInfo === '') {
    resp += `${DICT.help_message}\n\n`;
  } else {
    resp += `${helpInfo}\n\n`;
  }

  // Core commands.
  resp += Object.keys(DICT).map(command => `${command} = ${DICT.CMD_HELP[command]}`).join('\n');

  resp += _.compress(modules.map((module) => {
    if (typeof module.getHelp === 'function') {
      return module.getHelp(isAdmin);
    }

    return undefined;
  })).join('\n');

  return resp;
}

// Create the bot instance.
const bot = new Steam.SteamClient();
const botUser = new Steam.SteamUser(bot);
const botFriends = new Steam.SteamFriends(bot);

// Attempt to log on to Steam.
logger.log('Attempting Steam login...');
bot.connect();
bot.on('connected', () => {
  botUser.logOn({
    account_name: CONFIG.username,
    password: CONFIG.password,
  });
});

// Once logged on, configure self and initialize core modules.
bot.on('logOnResponse', () => {
  logger.log(DICT.SYSTEM.system_loggedin);

  // Tell Steam our screen name and status.
  botFriends.setPersonaState(Steam.EPersonaState.Online);
  botFriends.setPersonaName(CONFIG.displayName);

  // Initialize core modules.
  dota2.init(bot);
  friends.init(botFriends, CONFIG, DICT);
  admin.init(botFriends, DICT, shutdown);
  basic.init(DICT, help);

  // Loop through modules can call their onBotLogin handler if provided
  modules.forEach((module) => {
    if (typeof module.onBotLogin === 'function') {
      module.onBotLogin(bot);
    }
  });

  // Add administrators.
  if (CONFIG.admins) {
    logger.log('Friending admins...');
    CONFIG.admins.forEach((adminId) => {
      botFriends.addFriend(adminId);
      logger.log(minimap.map({ userid: adminId }, DICT.SYSTEM.system_added_friend));
      friends.addFriend(adminId);
    });
  }
});

bot.on('error', () => {
  logger.error('Jankbot has been logged off of the Steam network.');
  shutdown();
});

// Respond to messages. All core Jankbot functionality starts from this function.
botFriends.on('message', (source, rawMessage) => {
  // Be sure this person is remembered and run friends list name update.
  // friends.addFriend() can be run however many times on the same friend ID without duplicating.
  friends.addFriend(source);
  friends.updateTimestamp(source);

  // If the message is blank, do nothing (blank messages are received from 'is typing').
  if (!rawMessage || _.trim(rawMessage).length === 0) {
    return;
  }

  const message = rawMessage.toLowerCase();
  const fromUser = friends.nameOf(source);

  // Log the received message.
  logger.log(minimap.map(
    { user: fromUser, message: rawMessage },
    DICT.SYSTEM.system_msg_received,
  ));

  // Create the input letiable which we give to modules for parsing.
  const input = message.split(' ');

  // First, check if this is an admin function request.
  if (input[0] === 'admin') {
    // Authenticate as admin.
    if (friends.isAdmin(source)) {
      admin.command(source, input, rawMessage);
      return;
    }
    friends.messageUser(source, DICT.ERRORS.err_not_admin);
    return;
  }

  // Next, check if it is a default action. Basic will return true if it handles the input.
  if (basic.command(source, input, rawMessage)) {
    return;
  }

  // Finally, loop through other modules.
  for (let i = 0; i < modules.length; i += 1) {
    if (typeof modules[i].handle === 'function') {
      // If this module returns true after execution, stop parsing.
      if (modules[i].handle(rawMessage, source)) {
        return;
      }
    }
  }

  // If nothing was matched, send a random response back.
  friends.messageUser(source, randomResponse());
});

botFriends.on('friend', (steamId, type) => {
  // type 0 = unfriend, 2 = bot added them, 3 = they added bot
  logger.log(`Received a friend request from: ${steamId} of type ${type}`);
  if (type === Steam.EFriendRelationship.RequestRecipient) {
    // Refuse if they are blacklisted
    if (friends.checkIsBlacklisted(steamId)) {
      logger.log(minimap.map({ userid: steamId }, DICT.SYSTEM.system_blacklist_attempt));
      botFriends.removeFriend(steamId);
      return;

    // Refuse if too many friends
    } else if (friends.count() >= 250) {
      botFriends.removeFriend(steamId);
      logger.log('Rejected friend request: friend limit reached');
      return;
    }

    // Add friend
    botFriends.addFriend(steamId);
    logger.log(minimap.map({ userid: steamId }, DICT.SYSTEM.system_added_friend));
    friends.addFriend(steamId);

  // If removed
  } else if (type === Steam.EFriendRelationship.None) {
    logger.log(`Removed by: ${steamId}`);
  }
});

botFriends.on('personaState', (resp) => {
  logger.log(`${resp.friendid} is now known as ${resp.player_name}`);
  friends.updateFriendName(resp.friendid, resp.player_name);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
