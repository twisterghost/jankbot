# Jankbot
A Steam bot for Dota 2 communities

Current version: 1.0.1

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Running Jankbot](#running-jankbot)
4. [Administrating Your Jankbot](#administrating-your-jankbot)
5. [FAQ](#faq)
6. [For Developers](#for-developers)
7. [License](#license)

## Introduction
Jankbot is an open source module-oriented Steam bot designed to help organize
player communities. The system is open for use and devleoped with scale in mind
so that any size group can make use of it. Jankbot is written in NodeJS.

The Jankbot project is rapidly developing and is very welcome to pull requests.

## Installation
Installing jankbot is pretty simple, really!

You will need:
* NodeJS v0.10.x or higher
* NPM (comes with NodeJS)
* A Steam account with full privilages
* If on Windows, install the [Windows Prereqs](http://dev.jankdota.com/jankbot/Jankbot_Windows_Prereqs.zip).

Keep in mind that in order to have a fully privilaged Steam account, **you must
make at least one transaction on the account.** If you do not do this, you will
not be able to add the bot to your friends list.

**To begin**, download the Jankbot source code. You can get this from
http://jankdota.com/jankbot or from
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
  "modules" : [],
  "displayName" : "Jankbot",
  "dictionary"  : "english.json"
}

```

Let's run through this quickly. This file is loaded into Jankbot and configures
him to run to your specifications. Set the username and password to match the
credientials of the steam account you want Jankbot to use.

The next part is `"admins" : [],`. This is a list of the administator accounts
that Jankbot should accept admin commands from.

Next we have `"modules" : [],`. This is a list of the modules you want Jankbot
to use. Get more modules from http://jankdota.com/jankbot/modules!

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
2. If on Windows, install the [Windows Prereqs](http://dev.jankdota.com/jankbot/Jankbot_Windows_Prereqs.zip).
3. Make a steam account with at least one purchase on it
4. Download Jankbot's source code
5. Unzip it to a folder
6. CD to that folder in a terminal
7. Run `npm install`
8. Run `node config` **or** create `config.json` and use the template above
9. If you made your own config.json, edit config.json to fit your needs

## Running Jankbot

Once you have the config file set up and you've run `npm install` in the Jankbot
directory on your machine and you have a Steam account ready to go with at least
one purchase, you are READY TO RUN JANKBOT, WOOHOO!

**To run Jankbot:** `node jankbot`

And that's it! Jankbot should now log in to steam and accept friend requests.
Simply add him as you would another user and he will add you back, ready to help
improve your community!

## Adding Modules

*Get modules at [JankDota.com!](http://jankdota.com/jankbot/modules)*

Jankbot is designed to use custom modules to extend his abilities. To add a
module, begin by placing the module source file in the `bot_modules/` directory.

Next, you can either use the `config` program or add the module manually.

**To use the config program**, run `node config module add` and follow the
instructions.

**To add the module manually, follow the instructions below.**

Edit `config.json` and add the name of the module to the `modules`
property.

For example, if you were adding a module called "quotes" with a source file
`quotes.js`, your config.json file would look like this:

```javascript
{
  "username": "your_bot_account_username",
  "password": "your_bot_account_password",
  "admins" : [],
  "modules" : [
    "quotes"
  ],
  "displayName" : "Jankbot",
  "dictionary"  : "english.json"
}
```

To add more modules, simply repeat the same steps and add the names of the
modules to your config file. **Be sure to use commas to separate the module
names!**

**To remove modules**, simply run `node config module remove` and follow the
instructions, or manually remove by reversing the steps to add the module.

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

**Note:** Currently, admin commands are not set up to be multilingual due to
issues with word structure and language structure. This will be changed as soon
as a proper solution is found.

## FAQ
**Why won't Jankbot accept friend requests?**

You need to be sure that the account Jankbot is using has full permissions. You
must make at least 1 transaction on the account to make use of friends lists.

**How do I keep Jankbot running after I close the terminal?**

You may want to look into [forever](https://github.com/nodejitsu/forever). It
will keep scripts running...well, forever.

**What will happen if I delete the friends or logger modules?**

Puppies around the world will die and Jankbot will not be able to function.
Those modules are part of the core of Jankbot and are there to be used by other
modules.

**How do I update Jankbot?**

Updating Jankbot is as simple as replacing the files. Just make sure you don't
delete or overwrite any module data files like `friendslist`. Soon enough a
patch system will be put in place and Jankbot will be able to update himself.
Remember that you will need to restart Jankbot after updating.

**Why is Jankbot a 'he'?**

By all means, refer to Jankbot as Jankettebot. Just feels easier saying 'he'
instead of 'it' or 'Jankbot' all the time.

**I'm still having trouble. How can I get help?**

Tons of ways! You can email the head developer at twisterghost@jankdota.com,
tweet [@JankDota](http://twitter.com/jankdota), send a reddit message to
[/u/twisterghost](http://reddit.com/u/twisterghost), or if you think it is a
problem with the code, open an issue right here on GitHub.

## For Developers

Jankbot is an open source project far more than open to pull requests. If you
are a developer and wish to contribute, code review, fix a bug or whatever,
please join in! We can only do so much alone, but together Jankbot can be
strong!

**You can find the Jankbot module developer documentation
[here](http://jankdota.com/jankbot/docs)**

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
