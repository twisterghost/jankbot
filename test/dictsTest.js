var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

var parseJson = function (source) {
  return function() {
    JSON.parse(source);
  };
};

describe('dictionaries',function() {
  describe('#parseJSON',function() {
    it('should not throw an exception for any dictionary', function() {
      var dictFiles = fs.readdirSync('dict/');
      for(var f in dictFiles) {
        var file = path.join('dict/', dictFiles[f]);
        var source = fs.readFileSync(file);
        var parse = parseJson(source);
        expect(parse).to.not.throw(Error);
      }
    });
  });
});
