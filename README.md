# Jankbot
A Steam bot for Dota 2 communities

Current version: 2.0.0

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Running Jankbot](#running-jankbot)
4. [Administrating Your Jankbot](#administrating-your-jankbot)
5. [FAQ](#faq)
6. [For Developers](#for-developers)
7. [Module API](#module-api)
8. [License](#license)

## Introduction
Jankbot is an open source module-oriented Steam bot designed to help organize
player communities. The system is open for use and devleoped with scale in mind
so that any size group can make use of it. Jankbot is written in NodeJS.

The Jankbot project is rapidly developing and is very welcome to pull requests.

## Installation
Installing jankbot is pretty simple, really! Jankbot was designed
and developed on Linux machines. There shouldn't be any trouble installing on a
Linux distro, or OSX. Installing and running on Windows is possible, but
unsupported and requires prerequisites to be installed. Windows does not ship
with the resources to connect securely to Steam.

You will need:
* NodeJS v0.10.x or higher
* NPM (comes with NodeJS)
* A Steam account with full privilages (and Steam Guard disabled)

Keep in mind that in order to have a fully privilaged Steam account, **you must
make at least one transaction on the account.** If you do not do this, you will
not be able to add the bot to your friends list.

**To begin**, download or clone the Jankbot source code. You can get this
[here on Github](https://github.com/twisterghost/jankbot/archive/master.zip).

Next, using a terminal, run:

`cd /path/to/jankbot/folder` (Be sure to use the path you unzipped it to!)

Then, run `npm install`

You will see a bunch of text. If you aren't a programmer, don't worry about that
stuff.

**NOTE:** You may have issues installing the nodejs packages for Steam. It is
*recommended* that you use a linux operating system and use NodeJS v0.10.x

Once the packages are installed, you will need to set up the config file.

**Option 1: Run `node config` and go through the steps.** You can skip to the
next section if you do this route, though you may want to read option 2 to
understand what this part does.

**Option 2: Follow the instructions below to do it manually**

Create a file called `config.json` and use this template:

```javascript
{
  "username": "your_bot_account_username",
  "password": "your_bot_account_password",
  "admins" : [],
  "displayName" : "Jankbot",
  "dictionary"  : "english.json"
}

```

Let's run through this quickly. This file is loaded into Jankbot and configures
him to run to your specifications. Set the username and password to match the
credientials of the steam account you want Jankbot to use.

The next part is `"admins" : [],`. This is a list of the administator accounts
that Jankbot should accept admin commands from.

Now we have `"displayName" : "Jankbot",`. This is pretty self explanatory. This
is the name Jankbot will show up as on your friends list.

Finally we come to `"dictionary" : "english.json"`. Jankbot is built for DotA 2
which is highly international. So, Jankbot can learn different languages!
Unfortunately, JankDota's developers aren't fluent in much else besides English
and idiocy, so we only have an English dictionary out of the box. **HINT HINT
if any multilingual people out there want to translate and make some
dictionaries we would love you forever!**

Anyway, to use a different dictionary file, change that value to point to the
dictionary you'd like to use.

### Installation TL;DR

*Please be sure you understand what you're doing if you use this summary!*

1. Install [NodeJS 0.10.0 or higher](http://nodejs.org/)
2. Make a steam account with at least one purchase on it
3. Download Jankbot's source code
4. Unzip it to a folder
5. CD to that folder in a terminal
6. Run `npm install`
7. Run `node config` **or** create `config.json` and use the template above
8. If you made your own config.json, edit config.json to fit your needs

## Running Jankbot

Once you have the config file set up and you've run `npm install` in the Jankbot
directory on your machine and you have a Steam account ready to go with at least
one purchase, you are READY TO RUN JANKBOT, WOOHOO!

**To run Jankbot:** `node jankbot`

And that's it! Jankbot should now log in to steam and accept friend requests.
Simply add him as you would another user and he will add you back, ready to help
improve your community!

## Adding Modules

Jankbot is designed to use custom modules to extend his abilities. To add a
module, place the module source folder in the `bot_modules/`
directory. Jankbot will load the module next time you run the program.

## Administrating Your Jankbot
To use the admin commands, you will need to let Jankbot know who is an admin. To
do this, you will need to add the Steam ID numbers to the config file. To find
out your steam ID number, run Jankbot and message him saying "ping". Jankbot
will respond saying "pong" and your Steam ID.

Another way to get your ID is to visit http://steamidfinder.com/ and type in
your Steam login. It will come back with something like `STEAM_0:0:#########`.
Take that text and paste it into the search box and search again, then it will
give your 17 digit steam ID.

Once you have your Steam ID, add it to the `admins` property in the config file.

**You can again use the config program or do this manually.**

If your steam ID was 12345654321, your config file would look like this:

```javascript
{
  "username": "your_bot_account_username",
  "password": "your_bot_account_password",
  "admins" : ["12345654321"],
  "modules" : [
  ],
  "displayName" : "Jankbot",
  "dictionary"  : "english.json"
}
```

To add more administrators, simply add their Steam IDs to the list, separating
by commas.

Jankbot shows logs in the command line, but also saves logs in a file called
`output.log`.

Out of the box, Jankbot supports the following admin commands:

`admin quit` shuts down Jankbot (Note: if you run Jankbot with forever he will
simply restart)

`admin dump friends` dumps the friend data to the console and output.log

`admin dump users` dumps Jankbot's current user knowledge to the console and
output.log.

`admin broadcast YOUR_MESSAGE_HERE` broadcasts your given message to all of his
friends.

`admin lookup ID` will look up the user with the given ID and dump their info.

`admin inactive` will list all users who have not interacted with the bot in the
past week.

`admin kick ID` will unfriend the user with the given ID.

`admin add ID` will friend the user with the given ID.

`admin blacklist ID` will ban the user with the given ID from this bot.

`admin unblacklist ID` will unban the user with the given ID.

**Note:** Currently, admin commands are not set up to be multilingual due to
issues with word structure and language structure. This will be changed as soon
as a proper solution is found.

## FAQ
**Why won't Jankbot accept friend requests?**

You need to be sure that the account Jankbot is using has full permissions. You
must make at least 1 transaction on the account to make use of friends lists.

**How do I add Jankbot modules?**

Starting with Jankbot v2, to add a module, simply download the module and place
the folder inside of Jankbot's `bot_modules/` directory. Jankbot will
auto-discover modules on startup.

**Where can I find Jankbot modules?**

We are currently working on a solution for finding Jankbot modules more easily,
but for now, you can find a decent selection 
[here](https://github.com/JankGaming/jankbot-modules). If you are a developer
and have made your own module, you can submit a pull request to that repository
to have your module added to the list.

**How do I keep Jankbot running after I close the terminal?**

You may want to look into [pm2](https://github.com/unitech/pm2). It is a handy
program manager that will keep it running in the background.

**How do I update Jankbot?**

Updating Jankbot is as simple as replacing the files. Just make sure you don't
delete or overwrite any module data files like `friendslist`. Soon enough a
patch system will be put in place and Jankbot will be able to update himself.
Remember that you will need to restart Jankbot after updating.

**Why is Jankbot a 'he'?**

By all means, refer to Jankbot as Jankettebot. Just feels easier saying 'he'
instead of 'it' or 'Jankbot' all the time.

**I'm still having trouble. How can I get help?**

Tons of ways! You can email the head developer at michael@jankdota.com,
tweet [@JankDota](http://twitter.com/jankdota), send a reddit message to
[/u/twisterghost](http://reddit.com/u/twisterghost), or if you think it is a
problem with the code, open an issue right here on GitHub.

## For Developers

Jankbot is an open source project far more than open to pull requests. If you
are a developer and wish to contribute, code review, fix a bug or whatever,
please join in! We can only do so much alone, but together Jankbot can be
strong!

## Module API

Jankbot is designed to be extended by modules. This means anyone can write
extensions for Jankbot using the absurdly simple Jankbot API.

### Square 1

Create a directory for your module and add a `module.json` file that looks like
this:

```javascript
{
  "name": "Module Name",
  "author": "Author Name",
  "main": "module-file.js",
  "license": "MIT",
  "description": "Description of the module"
}
```

Edit `module.json` to your liking. This is the file Jankbot will use to identify
your module when it is loading. After that, just make your module file (with the
same file name as you put in `module.json`) and begin writing your module!

### The API

Your module needs to have at least these four functions exported:

##### exports.handle(input, source)

is the hook into Jankbot's execution system. Jankbot will pass the raw text 
and the ID of the user who sent the command to this function (input and source).
This function should parse the user input and decide if your module is capable
of handling the input, and if so, act upon the input. This function should 
return `true` if it handles the input, and false (or no return) otherwise. 
Returning `true` to Jankbot will stop other modules from checking the input. If
for some reason you want to handle the input but still allow other modules to
execute, simply do your work here and do not return anything.

##### exports.onExit() 

runs when Jankbot is shutting down. Useful for ensuring proper saves.

##### exports.getHelp() 

returns the help string for your module for when the a user
says 'help' to Jankbot.

#### Core Modules

Jankbot has 3 core modules to give functionality to modules. To use these 
modules, simply require them to your file with:

```javascript
var modulename = require('../../core/modulename');
```

Replacing 'modulename' with the module you need.

#### friends.js

The friends.js module gives access to the friends list, messaging and friend
management. It exposes a cornucopia of helpful functios:

##### nameOf(id)

Returns the current known steam name of the given user id.

##### idOf(name [, fuzzy])

Returns the steam ID of the given steam name. Set `fuzzy` to true to use fuzzy
search.

##### set(id, property, value)

Sets an arbitrary property on the user with the given id.

##### get(id, property)

Gets an arbitrary property from the user with the given id. Returns `undefined`
if the property was not found.

##### getAllFriends()

Returns the entire friends list object. Be gentle.

##### getMute(id)

Returns true if the user with the given ID has set Jankbot to mute.

##### setMute(id, mute)

Sets the mute status for the given user to on (true) or off (false).

##### messageUser(id, message)

Messages the user with the given id the given message.

##### broadcast(message, id)

Broadcasts a message to every user except the user with the given ID.

#### logger.js

The logger.js module is Jankbot's logging system. It should be used over
console.log for bookkeeping purposes.

##### log(message)

Logs the given message.

##### error(message)

Errors with the given message.

#### dota2.js

The good stuff. This module gives access to Dota 2 functionality. This core
module is very new and only has a few built in functions, but exposes `client`,
which is the full Dota2 client. For more info, see 
[node-dota2](https://github.com/RJacksonm1/node-dota2)


### Contributing
If you would like to contribute to the Jankbot project on GitHub, fork this repo
and send pull requests. We are more than happy to review and add changes. We
ask that **all pull requests are pulling into the
[master-test](https://github.com/twisterghost/jankbot/tree/master-test)
branch.** We will handle merging to master when the build is stable.

You may also feel free to add yourself to the `contributors` file.

## License

Jankbot is under the MIT Open Source License:

Copyright (c) 2013 Michael Barrett, JankDota.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
