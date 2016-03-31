'use strict';

// Handler for admin functionality.
let minimap = require('minimap');
let friends = require('./friends.js');
let logger = require('./logger.js');
let DICT;
let bot;
let shutdown;

exports.init = function(initBot, dictionary, killCommand) {
  bot = initBot;
  DICT = dictionary;
  shutdown = killCommand;
};

exports.command = function(source, input, original) {

  let command = input[1];
  if (actions.hasOwnProperty(command)) {
    actions[command](source, input, original);
    return;
  } else {
    return;
  }

};

let actions = {
  quit: function() {
    shutdown();
  },

  dump: function(source, input) {
    if (input[2] === 'friends') {
      logger.log(JSON.stringify(friends.getAllFriends()));
      friends.messageUser(source, DICT.ADMIN.dump_friends);
    } else if (input[2] === 'users') {
      logger.log(JSON.stringify(bot.users));
      friends.messageUser(source, DICT.ADMIN.dump_users);
    }
  },

  lookup: function(source, input) {
    let lookupList = friends.getAllFriends();
    if (lookupList.hasOwnProperty(input[2])) {
      let friend = lookupList[input[2]];
      friends.messageUser(source, JSON.stringify(friend, null, '  '));
    } else {
      friends.messageUser(source, DICT.ADMIN.lookup_error);
    }
  },

  inactive: function(source) {
    let ONE_WEEK = 60 * 60 * 24 * 7 * 1000;
    let inactiveList = friends.getAllFriends();
    let inactiveUsers = [];
    for (let inactiveFriend in inactiveList) {

      // If this user hasn't used this bot in a week, log it.
      if (new Date(inactiveList[inactiveFriend].lastMessageTime).getTime() <
          (new Date().getTime() - ONE_WEEK)) {
        inactiveUsers.push(inactiveList[inactiveFriend]);
      }
    }

    if (inactiveUsers.length === 0) {
      friends.messageUser(source, DICT.ADMIN.no_inactive_users);
    } else {
      friends.messageUser(source, JSON.stringify(inactiveUsers, null, '  '));
    }
  },

  kick: function(source, input) {
    let friendId = input[2];
    bot.removeFriend(input[2]);
    friends.removeFriend(friendId, function(success) {
      if (success) {
        friends.messageUser(source, minimap.map({id: friendId}, DICT.ADMIN.remove_friend_success));
      } else {
        friends.messageUser(source, minimap.map({id: friendId}, DICT.ADMIN.remove_friend_error));
      }
    });
  },

  blacklist: function(source, input) {
    friends.blacklist(input[2]);
    friends.messageUser(source, DICT.ADMIN.blacklist_add);
  },

  unblacklist: function(source, input) {
    friends.unBlacklist(input[2]);
    friends.messageUser(source, DICT.ADMIN.blacklist_remove);
  },

  add: function(source, input) {
    bot.addFriend(input[2]);
    friends.addFriend(input[2]);
  },

  broadcast: function(source, input, original) {
    let adminMessage = original.replace('admin broadcast', '');
    logger.log(minimap.map({message: adminMessage}, DICT.ADMIN.broadcast_log));
    friends.broadcast(source, adminMessage);
    friends.messageUser(source, DICT.ADMIN.broadcast_sent);
  }

};
