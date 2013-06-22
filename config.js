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

// For adding modules.
if (process.argv[2] == "module") {
  if (process.argv[3] == "add") {
    console.log("This will add a module to Jankbot.");
    console.log("First, be sure the module's file is in bot_modules/".bold.red);
    rl.question("What module would you like to add? Type the name of the file without the .js extension.\n(module) ",
      function(answer) {
        if (fs.existsSync(process.cwd() + "/bot_modules/" + answer + ".js")) {
          config['modules'].push(answer);
          fs.writeFileSync("config.json", JSON.stringify(config));
          console.log("Module successfully added.");
          process.exit();
        } else {
          console.log("I could not find the module you specified. Be sure the file is there!".red)
          process.exit();
        }
      });
  } else if (process.argv[3] == "remove") {

    // Removes a module from Jankbot, deleting the file if found.
    console.log("This will remove a module from Jankbot.");
    console.log("NOTE: If the file is in bot_modules/ it will be deleted.".bold.red);
    rl.question("What module would you like to remove? Type the name of the file without the .js extension.\n(module) ",
      function(answer) {
        if (config.modules.indexOf(answer) != -1) {
          var position = config.modules.indexOf(answer);
          config['modules'].splice(position, 1);
          fs.writeFileSync("config.json", JSON.stringify(config));
          console.log("Module successfully uninstalled.".green);
          if (fs.existsSync(process.cwd() + "/bot_modules/" + answer + ".js")) {
            fs.unlinkSync(process.cwd() + "/bot_modules/" + answer + ".js");
            console.log("Module file found and deleted.".green);
          }
          process.exit();
        } else {
          console.log("That module is not installed!".red)
          process.exit();
        }
      });
  } else {
    console.log("Please specify 'add' or 'remove'.".red);
    process.exit();
  }


} else if (process.argv[2] == "help") {
  console.log("Jankbot Configure Tool".green);
  console.log("Developed by JankDota. For more information visit http://jankdota.com/jankbot\n");
  console.log("To configure Jankbot:");
  console.log("    node config\n");
  console.log("To add a module:");
  console.log("    node config module add\n");
  console.log("To remove a module:");
  console.log("    node config module remove\n");
  process.exit();
} else {

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

              fs.writeFileSync("config.json", JSON.stringify(config));
              console.log("Your config.json file will look like:");
              console.log(config);
              console.log("\nYou're all set!".green);
              process.exit();
            });
          })
        });
    });
  });
}