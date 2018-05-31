/* eslint no-unused-expressions: 0 */
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const parseJson = function parseJson(source) {
  return function wrappedParseJson() {
    JSON.parse(source);
  };
};

describe('dictionaries', () => {
  describe('#parseJSON', () => {
    it('should not throw an exception for any dictionary', () => {
      const dictFiles = fs.readdirSync('dict/');
      Object.keys(dictFiles).forEach((f) => {
        const file = path.join('dict/', dictFiles[f]);
        const source = fs.readFileSync(file);
        const parse = parseJson(source);
        expect(parse).to.not.throw(Error);
      });
    });
  });
});
