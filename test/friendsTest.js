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

});