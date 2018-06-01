// Handler for admin functionality.
const minimap = require('minimap');
const _ = require('lodash');
const friends = require('./friends.js');
const logger = require('./logger.js');

let DICT;
let bot;
let shutdown;

const actions = {
  quit() {
    shutdown();
  },

  dump(source, input) {
    if (input[2] === 'friends') {
      logger.log(JSON.stringify(friends.getAllFriends()));
      friends.messageUser(source, DICT.ADMIN.dump_friends);
    } else if (input[2] === 'users') {
      logger.log(JSON.stringify(bot.users));
      friends.messageUser(source, DICT.ADMIN.dump_users);
    }
  },

  lookup(source, input) {
    const lookupList = friends.getAllFriends();
    if (lookupList[input[2]]) {
      const friend = lookupList[input[2]];
      friends.messageUser(source, JSON.stringify(friend, null, '  '));
    } else {
      friends.messageUser(source, DICT.ADMIN.lookup_error);
    }
  },

  inactive(source) {
    const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;
    const inactiveList = friends.getAllFriends();
    const inactiveUsers = _.compact(_.map(inactiveList, (inactiveFriend, id) => {
      if (new Date(inactiveFriend.lastMessageTime).getTime() <
          (new Date().getTime() - ONE_WEEK)) {
        return id;
      }

      return undefined;
    }));

    if (inactiveUsers.length === 0) {
      friends.messageUser(source, DICT.ADMIN.no_inactive_users);
    } else {
      friends.messageUser(source, JSON.stringify(inactiveUsers, null, '  '));
    }
  },

  kick(source, input) {
    const friendId = input[2];
    bot.removeFriend(input[2]);
    friends.removeFriend(friendId, (success) => {
      if (success) {
        friends.messageUser(
          source,
          minimap.map(
            { id: friendId },
            DICT.ADMIN.remove_friend_success,
          ),
        );
      } else {
        friends.messageUser(source, minimap.map({ id: friendId }, DICT.ADMIN.remove_friend_error));
      }
    });
  },

  blacklist(source, input) {
    friends.blacklist(input[2]);
    friends.messageUser(source, DICT.ADMIN.blacklist_add);
  },

  unblacklist(source, input) {
    friends.unBlacklist(input[2]);
    friends.messageUser(source, DICT.ADMIN.blacklist_remove);
  },

  add(source, input) {
    bot.addFriend(input[2]);
    friends.addFriend(input[2]);
  },

  broadcast(source, input, original) {
    const adminMessage = original.replace('admin broadcast', '');
    logger.log(minimap.map({ message: adminMessage }, DICT.ADMIN.broadcast_log));
    friends.broadcast(source, adminMessage);
    friends.messageUser(source, DICT.ADMIN.broadcast_sent);
  },

};

exports.init = function init(initBot, dictionary, killCommand) {
  bot = initBot;
  DICT = dictionary;
  shutdown = killCommand;
};

exports.command = function handleCommand(source, input, original) {
  const command = input[1];
  if (actions[command]) {
    actions[command](source, input, original);
  }
};

