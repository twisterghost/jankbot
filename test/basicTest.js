/*jshint expr: true*/
var expect = require('chai').expect;
var friends = require('../core/friends.js');
var basic = require('../core/basic.js');
var logger = require('../core/logger.js');
var sinon = require('sinon');
var mockery = require('mockery');
var mockSteam = require('./mocks/mockSteam');
var dictionary = require('../dict/english.json');

mockery.registerMock('steam', mockSteam);
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

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
friends.init(spiedBot, fakeConfig, dictionary);

basic.init(dictionary, helpFunction);

describe('Basic Functionality', function() {

  beforeEach(function() {
    spiedBot = {
      sendMessage: sinon.spy()
    };
    friends.init(spiedBot, fakeConfig);
  });

  it('broadcasts a message when it hears "lfg"', function() {
    basic.command('1', ['lfg'], 'lfg');
    expect(spiedBot.sendMessage.callCount).to.equal(3);
  });

  it('broadcasts a message when it hears "inhouse"', function() {
    basic.command('1', ['inhouse'], 'inhouse');
    expect(spiedBot.sendMessage.callCount).to.equal(3);
  });

  it('responds with a steam ID when it hears "ping"', function() {
    basic.command('1', ['ping'], 'ping');
    expect(spiedBot.sendMessage.args[0][1].indexOf('1')).to.be.above(-1);
  });

  it('calls the help function and responds when it hears "help"', function() {
    basic.command('1', ['help'], 'help');
    expect(helpFunction.called).to.be.true;
    expect(spiedBot.sendMessage.called).to.be.true;
  });

  it('sets the mute status to true when it hears "mute"', function() {
    basic.command('1', ['mute'], 'mute');
    expect(friends.getMute('1')).to.be.true;
  });

  it('sets the mute status to false when it hears "unmute"', function() {
    friends.setMute('1', true);
    basic.command('1', ['unmute'], 'unmute');
    expect(friends.getMute('1')).to.be.false;
  });

  it('responds to greetings', function() {
    basic.command('1', [dictionary.greetings[0]], dictionary.greetings[0]);
    expect(spiedBot.sendMessage.called).to.be.true;
  });

  it('returns false if it has no idea what to do', function() {
    expect(basic.command('1', ['ddd'], 'ddd')).to.be.false;
  });

});
