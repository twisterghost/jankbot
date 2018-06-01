/* eslint no-unused-expressions: 0 */
const test = require('ava');
const basic = require('../core/basic.js');
const friends = require('../core/friends.js');
const logger = require('../core/logger.js');
const sinon = require('sinon');
const dictionary = require('../dict/english.json');

const helpFunction = sinon.spy();

basic.init(dictionary, helpFunction);

test.before('stub logging', () => {
  sinon.stub(logger, 'log');
  sinon.stub(logger, 'error');
});

test.after('restore logging', () => {
  logger.log.restore();
  logger.error.restore();
});

test('broadcasts a message when it hears "lfg"', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');
  sandbox.stub(friends, 'broadcast').returns(true);

  basic.command('1', ['lfg'], 'lfg');

  t.true(friends.broadcast.calledOnce);
  t.true(friends.messageUser.calledOnce);
  sandbox.restore();
});

test('broadcasts a message when it hears "inhouse"', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');
  sandbox.stub(friends, 'broadcast').returns(true);

  basic.command('1', ['inhouse'], 'inhouse');

  t.true(friends.broadcast.calledOnce);
  t.true(friends.messageUser.calledOnce);
  sandbox.restore();
});

test('includes a password when it hears "inhouse" with a password', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');
  sandbox.stub(friends, 'broadcast').returns(true);

  basic.command('1', ['inhouse', 'hello'], 'inhouse hello');

  t.true(friends.broadcast.args[0][1].indexOf('hello') > -1);
  sandbox.restore();
});

test('responds with a steam ID when it hears "ping"', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');

  basic.command('1', ['ping'], 'ping');

  t.true(friends.messageUser.args[0][1].indexOf('1') > -1);
  sandbox.restore();
});

test('calls the help function and responds when it hears "help"', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');
  sandbox.stub(friends, 'isAdmin').returns(false);

  basic.command('1', ['help'], 'help');

  t.true(helpFunction.called);
  t.true(friends.messageUser.called);

  sandbox.restore();
});

test('sets the mute status to true when it hears "mute"', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');
  sandbox.stub(friends, 'setMute');

  basic.command('1', ['mute'], 'mute');

  t.true(friends.messageUser.called);
  t.true(friends.setMute.args[0][1]);
  sandbox.restore();
});

test('sets the mute status to false when it hears "unmute"', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');
  sandbox.stub(friends, 'setMute');

  basic.command('1', ['unmute'], 'unmute');

  t.true(friends.messageUser.called);
  t.false(friends.setMute.args[0][1]);
  sandbox.restore();
});

test('responds to greetings', (t) => {
  const sandbox = sinon.createSandbox();
  sandbox.stub(friends, 'messageUser');

  basic.command('1', [dictionary.greetings[0]], dictionary.greetings[0]);
  t.true(friends.messageUser.called);
  sandbox.restore();
});

test('returns false if it has no idea what to do', (t) => {
  t.false(basic.command('1', ['ddd'], 'ddd'));
});
