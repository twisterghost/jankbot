/* eslint no-unused-expressions: 0 */
const test = require('ava');
const fs = require('fs');
const path = require('path');

const parseJson = function parseJson(source) {
  return function wrappedParseJson() {
    JSON.parse(source);
  };
};

test('dictionaries should pass json parsing', (t) => {
  const dictFiles = fs.readdirSync('dict/');
  Object.keys(dictFiles).forEach((f) => {
    const file = path.join('dict/', dictFiles[f]);
    const source = fs.readFileSync(file);
    const parse = parseJson(source);
    t.notThrows(parse);
  });
});
