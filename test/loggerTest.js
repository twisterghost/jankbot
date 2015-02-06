/*jshint expr: true*/
var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var mockFs = {
  appendFile: sinon.spy()
};

mockery.registerMock('fs', mockFs);
mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var logger = require('../core/logger.js');
logger.noiseFree();

describe('Logger', function() {

  describe('log', function() {
    it('Writes to a file', function() {
      logger.log('test');
      expect(mockFs.appendFile.calledWith('output.log', 'LOG: test\n')).to.be.true;
    });
  });

  describe('error', function() {
    it('Writes to a file', function() {
      logger.error('test');
      expect(mockFs.appendFile.calledWith('output.log', 'ERR: test\n')).to.be.true;
    });
  });

});
