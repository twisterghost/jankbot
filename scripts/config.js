/**
 * config.js
 * Utility file to help configure Jankbot.
 */

// Imports.
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure the data directory exists.
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Open config.json or create it.
var configPath = path.join('data', 'config.json');
if (fs.existsSync(configPath)) {
  var config = JSON.parse(fs.readFileSync(configPath));
} else {
  config = {};
}

// Default config execution.
console.log('This will set up your config.json file for Jankbot.\n');
console.log('Leaving an answer blank will use the current config option.\n');

// Get username.
rl.question('What Steam account should Jankbot log in with?\n(username) ', function(answer) {
  if (answer) {
    config.username = answer;
  }

  // Get password.
  rl.question('\nWhat is the password for this account? (The password will be visible, verify it ' +
      'is correct.)\n(password) ',
    function(answer) {
      if (answer) {
        config.password = answer;
      }

      // Get admins.
      console.log('\n');
      console.log('NOTE: You for this you will need your steam ID. This is NOT your screen name.');
      console.log('We recommend using http://steamidfinder.com/');
      console.log('Enter a Steam account name and you will get something like STEAM_0:0:#######');
      console.log('Paste that in to the search box again and you get a 17 digit number.');
      console.log('USE THAT 17 DIGIT NUMBER HERE');
      console.log('You can also skip this part and use the "ping" command on jankbot to get your ID');
      console.log('Then, run this script again to add yourself as an admin later.');
      rl.question('Enter the 17 digit IDs of all admin accounts, seperated by spaces.\n(admins) ',
          function(answer) {
        if (answer) {
          config.admins = answer.split(' ');
        } else if (!config.admins) {
          config.admins = [];
        }

        // Get display name.
        rl.question('\nWhat should Jankbot show up as on your friends list?\n(displayName) ',
          function(answer) {
          if (answer) {
            config.displayName = answer;
          }

          // Get dictionary.
          rl.question('\nWhat dictionary file should Jankbot use? [Leave blank for english]\n' +
            '(dictionary) ',
            function(answer) {
            if (answer === '') {
              config.dictionary = 'english.json';
            } else {
              if (answer.indexOf('.json') === -1) {
                answer += '.json';
              }
              config.dictionary = answer;
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('Your config.json file will look like:');
            console.log(JSON.stringify(config, null, 2));
            console.log('\nYou\'re all set!');
            process.exit();
          });
        });
      });
  });
});
