/* eslint no-unused-expressions: 0 */
const test = require('ava');
const mockery = require('mockery');
const sinon = require('sinon');

const mockFs = {
  appendFileSync: sinon.spy(),
};

mockery.registerMock('fs', mockFs);
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false,
});

const logger = require('../core/logger.js');

test('log writes to file', (t) => {
  logger.log('test');
  t.true(mockFs.appendFileSync.calledWith('output.log', 'LOG: test\n'));
});

test('error writes to file', (t) => {
  logger.error('test');
  t.true(mockFs.appendFileSync.calledWith('error.log', 'ERR: test\n'));
});
