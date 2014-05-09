/**
 * config.js
 * Utility file to help configure Jankbot.
 */

// Imports.
var fs = require("fs");
var readline = require("readline");
var colors = require("colors");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Open config.json or create it.
if (fs.existsSync("config.json")) {
  var config = JSON.parse(fs.readFileSync("config.json"));
} else {
  config = {};
  config.modules = [];
}

// Default config execution.
console.log("This will set up your config.json file for Jankbot.\n".green);

// Get username.
rl.question("What Steam account should Jankbot log in with?\n(username) ", function(answer) {
  if (answer) {
    config['username'] = answer;
  }

  // Get password.
  rl.question("\nWhat is the password for this account? (The password will be visible, verify it is correct.)\n(password) ",
    function(answer) {
      if (answer) {
        config['password'] = answer;
      }

      // Get admins.
      console.log("\nNOTE: You for this you will need your steam ID. This is NOT your screen name.".bold.red);
      console.log("We recommend using http://steamidfinder.com/");
      console.log("Enter your personal Steam account name and you will get something like STEAM_0:0:#######");
      console.log("Take that and paste it in to the search box again and you will get a 17 digit number.");
      console.log("USE THAT 17 DIGIT NUMBER HERE");
      rl.question("Enter the 17 digit IDs of all admin accounts, seperated by spaces.\n(admins) ", function(answer) {
        if (answer) {
          config['admins'] = answer.split(" ");
        }

        // Get display name.
        rl.question("\nWhat should Jankbot show up as on your friends list?\n(displayName) ", function(answer) {
          if (answer) {
            config['displayName'] = answer;
          }

          // Get dictionary.
          rl.question("\nWhat dictionary file should Jankbot use? [Leave blank for english]\n(dictionary) ", function(answer) {
            if (answer == "") {
              config['dictionary'] = "english.json";
            } else {
              config['dictionary'] = answer;
            }

            fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
            console.log("Your config.json file will look like:");
            console.log(JSON.stringify(config, null, 2));
            console.log("\nYou're all set!".green);
            process.exit();
          });
        })
      });
  });
});