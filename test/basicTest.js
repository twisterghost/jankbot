var expect = require('chai').expect;
var friends = require('../core/friends.js');
var basic = require('../core/basic.js');
var logger = require('../core/logger.js');
var sinon = require('sinon');
var fs = require('fs');

var spiedBot;

var fakeConfig = {
  admins: [
    '1'
  ]
};
var helpFunction = sinon.spy();
var dictionary = require('../dict/english.json');

logger.noiseFree();
friends.initTest({
  '1': {
    'messages':[],
    'mute':false,
    'name':'Test Friend 1',
    'lastMessageTime': new Date()
  },
  '2': {
    'messages':[],
    'mute':false,
    'name':'Test Friend 2',
    'lastMessageTime': new Date() - 1000
  },
  '3': {
    'messages':[],
    'mute':false,
    'name':'Final Test Friend',
    'lastMessageTime': new Date()
  }
});
friends.init(spiedBot, fakeConfig);

basic.init(dictionary, helpFunction);

describe('Basic Functionality', function() {

  beforeEach(function() {
    spiedBot = {
      sendMessage: sinon.spy()
    }
    friends.init(spiedBot, fakeConfig);
  });

  it('broadcasts a message when it hears "lfg"', function() {
    basic.command('1', ['lfg'], 'lfg');
    expect(spiedBot.sendMessage.callCount).to.equal(3);
  });

});
