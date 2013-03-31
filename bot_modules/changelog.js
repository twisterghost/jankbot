var fs = require("fs");
var friends = require("./friends.js");

exports.canHandle = function(original) {
  if (original.toLowerCase() == "changelog") {
    return true;
  }
};

exports.handle = function(input, source, bot) {
  var change = fs.readFileSync("changelog");
  friends.messageUser(source, "" + change, bot);
};

exports.getHelp = function() {
  return "CHANGELOG\nchangelog - View Jankbot changelog\n";
};

exports.onExit = function() {
  // Nothing!
}
