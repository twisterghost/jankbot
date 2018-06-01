/* eslint no-unused-expressions: 0 */
// TODO: Fix the mocking / serial nature of these tests
const test = require('ava');
const mockery = require('mockery');
const sinon = require('sinon');
const dictionary = require('../dict/english.json');

const mockSteam = {
  EChatEntryType: {
    ChatMsg: 'hello',
  },
};

// Set up mocks for testing.
const loggerMock = {
  log() {},
  error() {},
};

function mockFriendData() {
  return {
    1: {
      messages: [],
      mute: false,
      name: 'Test Friend 1',
      lastMessageTime: new Date(),
    },
    2: {
      messages: [],
      mute: false,
      name: 'Test Friend 2',
      lastMessageTime: new Date() - 1000,
    },
    3: {
      messages: [],
      mute: false,
      name: 'Final Test Friend',
      lastMessageTime: new Date(),
    },
  };
}

const botMock = {
  users: {
    1: {
      playerName: 'tested',
    },
  },
  sendMessage: sinon.spy(),
};

mockery.registerMock('./logger.js', loggerMock);
mockery.registerMock('steam', mockSteam);
mockery.registerMock('fs', {
  writeFileSync: () => {},
  existsSync: () => false,
});
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false,
});

const friends = require('../core/friends.js');

test.beforeEach('set up friends module and bot mock', () => {
  friends.clearBlacklist();
  friends.setFriendsData(mockFriendData());
  botMock.sendMessage = sinon.spy();
  friends.init(botMock, {
    admins: [
      '1',
    ],
  }, dictionary);
});

test.after('disbale mockery', () => mockery.disable);

test.serial('getAllFriends() returns known friends', (t) => {
  const friendsList = friends.getAllFriends();
  t.is(Object.keys(friendsList).length, 3);
});

test.serial('nameOf() should return the name of a known friend', (t) => {
  t.is(friends.nameOf('1'), 'Test Friend 1');
});

test.serial('nameOf() should return "Someone" if the id is unknown', (t) => {
  t.is(friends.nameOf('10'), 'Someone');
});

test.serial('idOf() should return the ID of an exact match', (t) => {
  t.is(friends.idOf('Test Friend 1'), '1');
});

test.serial('idOf() should return the ID of a fuzzy match if given the parameter', (t) => {
  t.is(friends.idOf('Fnl', true), '3');
});

test.serial('idOf() shouldnt return the ID of a fuzzy match if not given the parameter', (t) => {
  t.is(friends.idOf('Fnl'), undefined);
});

test.serial('idOf() should return undefined for a failed fuzzy find', (t) => {
  t.is(friends.idOf('abcd'), undefined);
});

test.serial('idOf() should return undefined for an unknown friend name', (t) => {
  t.is(friends.idOf('q', true), undefined);
});

test.serial('set() should set an arbitrary friend parameter', (t) => {
  friends.set('1', 'test', 'hello world');
  t.is(friends.getAllFriends()['1'].test, 'hello world');
});

test.serial('set() should return true when successfully setting a value', (t) => {
  const result = friends.set('1', 'test', 'hello world');
  t.is(friends.getAllFriends()['1'].test, 'hello world');
  t.true(result);
});

test.serial('set() should return false when it cant find a friend', (t) => {
  t.false(friends.set('1000', 'test', 'hello'));
});

test.serial('get() should get an arbitrary friends parameter', (t) => {
  friends.getAllFriends()['1'].test = 'hello world';
  t.is(friends.get('1', 'test'), 'hello world');
});

test.serial('get() should return undefined for an unknown parameter', (t) => {
  t.is(friends.get('1', 'test2'), undefined);
});

test.serial('get() should return undefined for a friend that doesnt exist', (t) => {
  t.is(friends.get('100', 'test'), undefined);
});

test.serial('blacklist() should add a user to the blacklist', (t) => {
  friends.blacklist('1234');
  t.is(friends.getBlacklist()[0], '1234');
});

test.serial('blacklist() shouldnt add the same user twise', (t) => {
  friends.blacklist('1234');
  friends.blacklist('1234');
  t.is(friends.getBlacklist().length, 1);
});

test.serial('unBlacklist() should remove a user from the blacklist', (t) => {
  friends.blacklist('1234');
  friends.unBlacklist('1234');
  t.is(friends.getBlacklist().length, 0);
});

test.serial('checkIfBlacklisted() should know if a user is blacklisted', (t) => {
  friends.blacklist('1234');
  t.true(friends.checkIsBlacklisted('1234'));
});

test.serial('checkIfBlacklisted() should know if a user is not blacklisted', (t) => {
  t.false(friends.checkIsBlacklisted('1234'));
});

test.serial('addFriend() should add a friend to the friends list', (t) => {
  friends.addFriend('1234');
  t.not(friends.getAllFriends()['1234'], undefined);
});

test.serial('addFriend() should be able to add multiple friends', (t) => {
  friends.addFriend('1234');
  friends.addFriend('2345');
  friends.addFriend('3456');
  t.not(friends.getAllFriends()['1234'], undefined);
  t.not(friends.getAllFriends()['2345'], undefined);
  t.not(friends.getAllFriends()['3456'], undefined);
});

test.serial('removeFriend() should remove a friend that has been added', (t) => {
  friends.addFriend('1234');
  friends.removeFriend('1234', () => {});
  t.is(friends.getAllFriends()['1234'], undefined);
});

test.cb('removeFriend() should call back true if successful', (t) => {
  friends.addFriend('1234');
  friends.removeFriend('1234', (result) => {
    t.true(result);
    t.end();
  });
});

test.cb('removeFriend() should call back false if unsuccessful', (t) => {
  friends.removeFriend('1234', (result) => {
    t.false(result);
    t.end();
  });
});

test.serial('getAllFriends() should return the friends list', (t) => {
  friends.addFriend('1234');
  t.not(friends.getAllFriends()['1234'], undefined);
});

test.serial('getBlacklist() should return the blacklist', (t) => {
  friends.blacklist('1234');
  t.is(friends.getBlacklist().length, 1);
});

test.serial('setMute() should set the status of a users mute', (t) => {
  friends.addFriend('1234');
  friends.setMute('1234', true);
  t.true(friends.getAllFriends()['1234'].mute);
});

test.serial('getMute() should get the status of a users mute', (t) => {
  friends.addFriend('1234');
  friends.setMute('1234', true);
  t.true(friends.getMute('1234'));
});

test.serial('getMute() returns false when the user doesnt exist', (t) => {
  t.false(friends.getMute('1000'));
});

test.serial('forEach() should run a function for each friend', (t) => {
  let friendIds = '';
  friends.forEach((friend) => {
    friendIds += friend;
  });
  t.is(friendIds, '123');
});

test.serial('isAdmin() should return true if a friend is an administrator', (t) => {
  t.true(friends.isAdmin('1'));
  t.false(friends.isAdmin('2'));
});

test.serial('updateFriendName() updates the name of a friend', (t) => {
  friends.updateFriendName(1, 'testName!');
  t.is(friends.getAllFriends()['1'].name, 'testName!');
});

test.serial('updateTimestamp() updates the lastMessageTime property of a freind', (t) => {
  const startDate = new Date(friends.get('2', 'lastMessageTime')).getTime();
  friends.updateTimestamp('2');
  const newDate = new Date(friends.get('2', 'lastMessageTime')).getTime();
  t.true(newDate > startDate);
});

test.serial('messageUser() sends a message to the specified user', (t) => {
  friends.messageUser('testID', 'hello world');
  t.true(botMock.sendMessage.calledWith('testID', 'hello world'));
});

test.serial('messageUser() wont message the user if they are muted and its a broadcast', (t) => {
  friends.setMute('1', true);
  friends.messageUser('1', 'hello world', true);
  t.is(botMock.sendMessage.callCount, 0);
});

test.serial('count() returns the number of friends on the bot', (t) => {
  t.is(friends.count(), 3);
});


test.serial('broadcast() tries to message all users except the one who sent it', (t) => {
  friends.broadcast('2', 'hello world');
  t.is(botMock.sendMessage.callCount, 2);
  t.true(botMock.sendMessage.calledWith('1', 'hello world'));
  t.true(botMock.sendMessage.calledWith('3', 'hello world'));
});

test.serial('broadcast() doesn\'t broadcast and returns false if a user tries to spam', (t) => {
  let res = friends.broadcast('2', 'hello world');
  t.is(botMock.sendMessage.callCount, 2);
  t.true(botMock.sendMessage.calledWith('1', 'hello world'));
  t.true(botMock.sendMessage.calledWith('3', 'hello world'));

  res = friends.broadcast('2', 'hello world');
  t.false(res);

  // Only one more message sent - the error message.
  t.is(botMock.sendMessage.callCount, 3);
});

test.serial('broadcast() allows admins to broadcast freely', (t) => {
  let res = friends.broadcast('1', 'hello world');
  t.is(botMock.sendMessage.callCount, 2);
  t.true(botMock.sendMessage.calledWith('2', 'hello world'));
  t.true(botMock.sendMessage.calledWith('3', 'hello world'));

  res = friends.broadcast('1', 'hello world');
  t.true(res);
  t.is(botMock.sendMessage.callCount, 4);
});

