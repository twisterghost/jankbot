/* jshint expr: true */
const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');
const mockSteam = require('./mocks/mockSteam');
const dictionary = require('../dict/english.json');

// Set up mocks for testing.
const loggerMock = {
  log() {},
  error() {},
};

const mockFriendData = {
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
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false,
});

const friends = require('../core/friends.js');

describe('friends.js', () => {
  beforeEach(() => {
    friends.initTest(_.cloneDeep(mockFriendData));
    botMock.sendMessage = sinon.spy();
    friends.init(botMock, {
      admins: [
        '1',
      ],
    }, dictionary);
  });

  describe('#getAllFriends()', () => {
    it('should return all known friends', () => {
      const friendsList = friends.getAllFriends();
      expect(Object.keys(friendsList).length).to.equal(3);
    });
  });

  describe('#nameOf()', () => {
    it('should return the name of a known friend', () => {
      expect(friends.nameOf('1')).to.equal('Test Friend 1');
    });

    it('should return "Someone" if the id is unknown', () => {
      expect(friends.nameOf('10')).to.equal('Someone');
    });
  });

  describe('#idOf()', () => {
    it('should return the ID of an exact match', () => {
      expect(friends.idOf('Test Friend 1')).to.equal('1');
    });

    it('should return the ID of a fuzzy match if given the parameter', () => {
      expect(friends.idOf('Fnl', true)).to.equal('3');
    });

    it('shouldnt return the ID of a fuzzy match if not given the parameter', () => {
      expect(friends.idOf('Fnl')).to.be.undefined;
    });

    it('should return undefined for a failed fuzzy find', () => {
      expect(friends.idOf('abcd')).to.be.undefined;
    });

    it('should return undefined for an unknown friend name', () => {
      expect(friends.idOf('q', true)).to.be.undefined;
    });
  });

  describe('#set()', () => {
    it('should set an arbitrary friend parameter', () => {
      friends.set('1', 'test', 'hello world');
      expect(friends.getAllFriends()['1'].test).to.equal('hello world');
    });

    it('should return true when successfully setting a value', () => {
      const result = friends.set('1', 'test', 'hello world');
      expect(friends.getAllFriends()['1'].test).to.equal('hello world');
      expect(result).to.be.true;
    });

    it('should return false when it cant find a friend', () => {
      expect(friends.set('1000', 'test', 'hello')).to.be.false;
    });
  });

  describe('#get()', () => {
    it('should get an arbitrary friends parameter', () => {
      friends.getAllFriends()['1'].test = 'hello world';
      expect(friends.get('1', 'test')).to.equal('hello world');
    });

    it('should return undefined for an unknown parameter', () => {
      expect(friends.get('1', 'test2')).to.be.undefined;
    });

    it('should return undefined for a friend that doesnt exist', () => {
      expect(friends.get('100', 'test')).to.be.undefined;
    });
  });

  describe('#blacklist()', () => {
    it('should add a user to the blacklist', () => {
      friends.blacklist('1234');
      expect(friends.getBlacklist()[0]).to.equal('1234');
    });

    it('shouldnt add the same user twise', () => {
      friends.blacklist('1234');
      friends.blacklist('1234');
      expect(friends.getBlacklist().length).to.equal(1);
    });
  });

  describe('#unBlacklist()', () => {
    it('should remove a user from the blacklist', () => {
      friends.blacklist('1234');
      friends.unBlacklist('1234');
      expect(friends.getBlacklist().length).to.equal(0);
    });
  });

  describe('#checkIsBlacklisted()', () => {
    it('should know if a user is blacklisted', () => {
      friends.blacklist('1234');
      expect(friends.checkIsBlacklisted('1234')).to.be.true;
    });

    it('should know if a user is not blacklisted', () => {
      expect(friends.checkIsBlacklisted('1234')).to.be.false;
    });
  });

  describe('#addFriend()', () => {
    it('should add a friend to the friends list', () => {
      friends.addFriend('1234');
      expect(friends.getAllFriends()['1234']).to.not.be.undefined;
    });

    it('should be able to add multiple friends', () => {
      friends.addFriend('1234');
      friends.addFriend('2345');
      friends.addFriend('3456');
      expect(friends.getAllFriends()['1234']).to.not.be.undefined;
      expect(friends.getAllFriends()['2345']).to.not.be.undefined;
      expect(friends.getAllFriends()['3456']).to.not.be.undefined;
    });
  });

  describe('#removeFriend()', () => {
    it('should remove a friend that has been added', () => {
      friends.addFriend('1234');
      friends.removeFriend('1234', () => {});
      expect(friends.getAllFriends()['1234']).to.be.undefined;
    });

    it('should call back true if successful', (done) => {
      friends.addFriend('1234');
      friends.removeFriend('1234', (result) => {
        expect(result).to.be.true;
        done();
      });
    });

    it('should call back false if unsuccessful', (done) => {
      friends.removeFriend('1234', (result) => {
        expect(result).to.be.false;
        done();
      });
    });
  });

  describe('#getAllFriends()', () => {
    it('should return the friends list', () => {
      friends.addFriend('1234');
      expect(friends.getAllFriends()['1234']).to.not.be.undefined;
    });
  });

  describe('#getBlacklist()', () => {
    it('should return the blacklist', () => {
      friends.blacklist('1234');
      expect(friends.getBlacklist().length).to.equal(1);
    });
  });

  describe('#setMute()', () => {
    it('should set the status of a users mute', () => {
      friends.addFriend('1234');
      friends.setMute('1234', true);
      expect(friends.getAllFriends()['1234'].mute).to.be.true;
    });
  });

  describe('#getMute()', () => {
    it('should get the status of a users mute', () => {
      friends.addFriend('1234');
      friends.setMute('1234', true);
      expect(friends.getMute('1234')).to.be.true;
    });

    it('returns false when the user doesnt exist', () => {
      expect(friends.getMute('1000')).to.be.false;
    });
  });

  describe('#forEach()', () => {
    it('should run a function for each friend', () => {
      let friendIds = '';
      friends.forEach((friend) => {
        friendIds += friend;
      });
      expect(friendIds).to.equal('123');
    });
  });

  describe('#isAdmin()', () => {
    it('should return true if a friend is an administrator', () => {
      expect(friends.isAdmin('1')).to.be.true;
      expect(friends.isAdmin('2')).to.be.false;
    });
  });

  describe('#updateFriendName()', () => {
    it('updates the name of a friend', () => {
      friends.updateFriendName(1, 'testName!');
      expect(friends.getAllFriends()['1'].name).to.equal('testName!');
    });
  });

  describe('#updateTimstamp()', () => {
    it('updates the lastMessageTime property of a freind', () => {
      const startDate = new Date(friends.get('2', 'lastMessageTime')).getTime();
      friends.updateTimestamp('2');
      const newDate = new Date(friends.get('2', 'lastMessageTime')).getTime();
      expect(newDate).to.be.above(startDate);
    });
  });

  describe('#messageUser()', () => {
    it('sends a message to the specified user', () => {
      friends.messageUser('testID', 'hello world');
      expect(botMock.sendMessage.calledWith('testID', 'hello world')).to.be.true;
    });

    it('wont message the user if they are muted and its a broadcast', () => {
      friends.setMute('1', true);
      friends.messageUser('1', 'hello world', true);
      expect(botMock.sendMessage.callCount).to.equal(0);
    });
  });

  describe('#count()', () => {
    it('returns the number of friends on the bot', () => {
      expect(friends.count()).to.equal(3);
    });
  });

  describe('#broadcast', () => {
    it('tries to message all users except the one who sent it', () => {
      friends.broadcast('2', 'hello world');
      expect(botMock.sendMessage.callCount).to.equal(2);
      expect(botMock.sendMessage.calledWith('1', 'hello world')).to.be.true;
      expect(botMock.sendMessage.calledWith('3', 'hello world')).to.be.true;
    });

    it('doesn\'t broadcast and returns false if a user tries to spam', () => {
      let res = friends.broadcast('2', 'hello world');
      expect(botMock.sendMessage.callCount).to.equal(2);
      expect(botMock.sendMessage.calledWith('1', 'hello world')).to.be.true;
      expect(botMock.sendMessage.calledWith('3', 'hello world')).to.be.true;

      res = friends.broadcast('2', 'hello world');
      expect(res).to.be.false;

      // Only one more message sent - the error message.
      expect(botMock.sendMessage.callCount).to.equal(3);
    });

    it('allows admins to broadcast freely', () => {
      let res = friends.broadcast('1', 'hello world');
      expect(botMock.sendMessage.callCount).to.equal(2);
      expect(botMock.sendMessage.calledWith('2', 'hello world')).to.be.true;
      expect(botMock.sendMessage.calledWith('3', 'hello world')).to.be.true;

      res = friends.broadcast('1', 'hello world');
      expect(res).to.be.true;
      expect(botMock.sendMessage.callCount).to.equal(4);
    });
  });

  mockery.disable();
});
