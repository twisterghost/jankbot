/* eslint no-unused-expressions: 0 */
const { expect } = require('chai');
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

describe('Logger', () => {
  describe('log', () => {
    it('Writes to a file', () => {
      logger.log('test');
      expect(mockFs.appendFileSync.calledWith('output.log', 'LOG: test\n')).to.be.true;
    });
  });

  describe('error', () => {
    it('Writes to a file', () => {
      logger.error('test');
      expect(mockFs.appendFileSync.calledWith('error.log', 'ERR: test\n')).to.be.true;
    });
  });
});
