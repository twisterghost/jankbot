var request = require('request');
var friends = require('./friends.js');

// Handler.
exports.handle = function(input, source, bot) {
  input = input.split(" ");
  request('http://api.mumble.com/mumble/cvp.php?token=LSG-8C-2F66BDEB', function (err, resp, body) {
    if (!err && resp.statusCode == 200) {
      var mumbleInfo = JSON.parse(body);
      var message = "Here is the current status of mumble:\n" + getUserList(mumbleInfo.root);
      friends.messageUser(source, message, bot);
    }
  });
}


// Can handle function.
exports.canHandle = function(original) {
  var input = original.toLowerCase().split(" ");
  return input[0] == "mumble";
}


exports.onExit = function() {
  // Empty!
}


exports.getHelp = function() {
  return "MUMBLE\n" +
  "mumble - See who is currently in Jank Mumble\n";
}


// Parses mumble JSON for user list.
function getUserList(mumble) {

  var userInfo = "";

  // Add channel name.
  userInfo += mumble.name + "\n";

  // Add users from channel.
  for (var i = 0; i < mumble.users.length; i++) {
    userInfo += "|-> " + mumble.users[i].name + "\n";
  }

  // Call recursively on subchannels.
  if (mumble.channels.length > 0) {

    // For each channel, call recursively.
    for (var i = 0; i < mumble.channels.length; i++) {
      userInfo += getUserList(mumble.channels[i]);
    }
  }

  return userInfo;
}

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
}
