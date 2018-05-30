const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

const parseJson = function (source) {
  return function () {
    JSON.parse(source);
  };
};

describe('dictionaries', () => {
  describe('#parseJSON', () => {
    it('should not throw an exception for any dictionary', () => {
      const dictFiles = fs.readdirSync('dict/');
      for (const f in dictFiles) {
        const file = path.join('dict/', dictFiles[f]);
        const source = fs.readFileSync(file);
        const parse = parseJson(source);
        expect(parse).to.not.throw(Error);
      }
    });
  });
});
