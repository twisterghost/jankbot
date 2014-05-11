var expect = require('chai').expect;
var friends = require('../core/friends.js');
friends.initTest();

describe('friends.js', function() {

  beforeEach(function() {
    friends.initTest();
  });

  describe('#getAllFriends()', function() {

    it('should return all known friends', function() {
      var friendsList = friends.getAllFriends();
      expect(Object.keys(friendsList).length).to.equal(3);
    });

  });

  describe('#nameOf()', function() {
    it('should return the name of a known friend', function() {
      expect(friends.nameOf('1')).to.equal('Test Friend 1');
    });

    it('should return "Someone" if the id is unknown', function() {
      expect(friends.nameOf('10')).to.equal('Someone');
    })
  });

  describe('#idOf()', function() {
    it('should return the ID of an exact match', function() {
      expect(friends.idOf('Test Friend 1')).to.equal('1');
    });

    it('should return the ID of a fuzzy match if given the parameter', function() {
      expect(friends.idOf('Fnl', true)).to.equal('3');
    });

    it('shouldnt return the ID of a fuzzy match if not given the parameter', function() {
      expect(friends.idOf('Fnl')).to.be.undefined;
    });

    it('should return undefined for an unknown friend name', function() {
      expect(friends.idOf('q', true)).to.be.undefined;
    });
  });

  describe('#set()', function() {
    it('should set an arbitrary friend parameter', function() {
      friends.set('1', 'test', 'hello world');
      expect(friends.getAllFriends()['1'].test).to.equal('hello world');
    });

    it('should return true when successfully setting a value', function() {
      var result = friends.set('1', 'test', 'hello world');
      expect(friends.getAllFriends()['1'].test).to.equal('hello world');
      expect(result).to.be.true;
    });
  });

  describe('#get()', function() {
    it('should get an arbitrary friends parameter', function() {
      friends.getAllFriends()['1'].test = 'hello world';
      expect(friends.get('1', 'test')).to.equal('hello world');
    });

    it('should return undefined for an unknown parameter', function() {
      expect(friends.get('1', 'test')).to.be.undefined;
    });
  });

  describe('#blacklist()', function() {
    it('should add a user to the blacklist', function() {
      friends.blacklist('1234');
      expect(friends.getBlacklist()[0]).to.equal('1234');
    });

    it('shouldnt add the same user twise', function() {
      friends.blacklist('1234');
      friends.blacklist('1234');
      expect(friends.getBlacklist().length).to.equal(1);
    });
  });

  describe('#unBlacklist()', function() {
    it('should remove a user from the blacklist', function() {
      friends.rawBlacklist = ['1234'];
      friends.unBlacklist('1234');
      expect(friends.getBlacklist().length).to.equal(0);
    });
  });

  describe('#checkIsBlacklisted()', function() {
    it('should know if a user is blacklisted', function() {
      friends.blacklist('1234');
      expect(friends.checkIsBlacklisted('1234')).to.be.true;
    });

    it('should know if a user is not blacklisted', function() {
      expect(friends.checkIsBlacklisted('1234')).to.be.false;
    });
  });

  describe('#addFriend()', function() {
    it('should add a friend to the friends list', function() {
      friends.addFriend('1234');
      expect(friends.getAllFriends()['1234']).to.not.be.undefined;
    });

    it('should be able to add multiple friends', function() {
      friends.addFriend('1234');
      friends.addFriend('2345');
      friends.addFriend('3456');
      expect(friends.getAllFriends()['1234']).to.not.be.undefined;
      expect(friends.getAllFriends()['2345']).to.not.be.undefined;
      expect(friends.getAllFriends()['3456']).to.not.be.undefined;
    });
  });

  describe('#removeFriend()', function() {
    it('should remove a friend that has been added', function() {
      friends.addFriend('1234');
      friends.removeFriend('1234', function(){});
      expect(friends.getAllFriends()['1234']).to.be.undefined;
    });

    it('should call back true if successful', function(done) {
      friends.addFriend('1234');
      friends.removeFriend('1234', function(result) {
        expect(result).to.be.true;
        done();
      });
    });

    it('should call back false if unsuccessful', function(done) {
      friends.removeFriend('1234', function(result) {
        expect(result).to.be.false;
        done();
      });
    });
  });

  describe('#getAllFriends()', function() {
    it('should return the friends list', function() {
      friends.addFriend('1234');
      expect(friends.getAllFriends()['1234']).to.not.be.undefined;
    });
  });

  describe('#getBlacklist()', function() {
    it('should return the blacklist', function() {
      friends.blacklist('1234');
      expect(friends.getBlacklist().length).to.equal(1);
    });
  });

  describe('#setMute()', function() {
    it('should set the status of a users mute', function() {
      friends.addFriend('1234');
      friends.setMute('1234', true);
      expect(friends.getAllFriends()['1234'].mute).to.be.true;
    });
  });

  describe('#getMute()', function() {
    it('should get the status of a users mute', function() {
      friends.addFriend('1234');
      friends.setMute('1234', true);
      expect(friends.getMute('1234')).to.be.true;
    });
  });

});