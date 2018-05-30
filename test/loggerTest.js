/* jshint expr: true */
const expect = require('chai').expect;
const mockery = require('mockery');
const sinon = require('sinon');

const mockFs = {
  appendFile: sinon.spy(),
};

mockery.registerMock('fs', mockFs);
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false,
});

const logger = require('../core/logger.js');

logger.noiseFree();

describe('Logger', () => {
  describe('log', () => {
    it('Writes to a file', () => {
      logger.log('test');
      expect(mockFs.appendFile.calledWith('output.log', 'LOG: test\n')).to.be.true;
    });
  });

  describe('error', () => {
    it('Writes to a file', () => {
      logger.error('test');
      expect(mockFs.appendFile.calledWith('output.log', 'ERR: test\n')).to.be.true;
    });
  });
});
