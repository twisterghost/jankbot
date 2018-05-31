/* eslint no-unused-expressions: 0 */
const { expect } = require('chai');
const friends = require('../core/friends.js');
const basic = require('../core/basic.js');
const logger = require('../core/logger.js');
const sinon = require('sinon');
const mockery = require('mockery');
const mockSteam = require('./mocks/mockSteam');
const dictionary = require('../dict/english.json');

mockery.registerMock('steam', mockSteam);
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false,
});

let spiedBot;

const fakeConfig = {
  admins: [
    '1',
  ],
};
const helpFunction = sinon.spy();

logger.noiseFree();
friends.initTest({
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
});
friends.init(spiedBot, fakeConfig, dictionary);

basic.init(dictionary, helpFunction);

describe('Basic Functionality', () => {
  beforeEach(() => {
    spiedBot = {
      sendMessage: sinon.spy(),
    };
    friends.init(spiedBot, fakeConfig);
  });

  it('broadcasts a message when it hears "lfg"', () => {
    basic.command('1', ['lfg'], 'lfg');
    expect(spiedBot.sendMessage.callCount).to.equal(3);
  });

  it('broadcasts a message when it hears "inhouse"', () => {
    basic.command('1', ['inhouse'], 'inhouse');
    expect(spiedBot.sendMessage.callCount).to.equal(3);
  });

  it('includes a password when it hears "inhouse" with a password', () => {
    basic.command('1', ['inhouse', 'hello'], 'inhouse hello');
    expect(spiedBot.sendMessage.args[0][1].indexOf('hello')).to.be.above(-1);
  });

  it('responds with a steam ID when it hears "ping"', () => {
    basic.command('1', ['ping'], 'ping');
    expect(spiedBot.sendMessage.args[0][1].indexOf('1')).to.be.above(-1);
  });

  it('calls the help function and responds when it hears "help"', () => {
    basic.command('1', ['help'], 'help');
    expect(helpFunction.called).to.be.true;
    expect(spiedBot.sendMessage.called).to.be.true;
  });

  it('sets the mute status to true when it hears "mute"', () => {
    basic.command('1', ['mute'], 'mute');
    expect(friends.getMute('1')).to.be.true;
  });

  it('sets the mute status to false when it hears "unmute"', () => {
    friends.setMute('1', true);
    basic.command('1', ['unmute'], 'unmute');
    expect(friends.getMute('1')).to.be.false;
  });

  it('responds to greetings', () => {
    basic.command('1', [dictionary.greetings[0]], dictionary.greetings[0]);
    expect(spiedBot.sendMessage.called).to.be.true;
  });

  it('returns false if it has no idea what to do', () => {
    expect(basic.command('1', ['ddd'], 'ddd')).to.be.false;
  });
});
