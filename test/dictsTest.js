var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

var parseJson = function (source) {
    JSON.parse(source);
}

describe('dictionaries',function() {
  describe('#parseJSON',function() {
    it('should not throw an exception for any dictionary', function() {
      var dictFiles = fs.readdirSync('dict/');
      for(var f in dictFiles) {
          var file = path.join('dict/', dictFiles[f]);
          console.log('parsing file ' + file);
          var source = fs.readFileSync(file);
          expect(parseJson(source)).to.not.throw(Error);
        }
    });
  });
});
