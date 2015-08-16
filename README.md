# Jankbot
A Steam chat bot, built for Dota 2, made for everyone!

Current version: 2.1.0

Maintained by [@twisterghost](http://twitter.com/twisterghost)

[![Build Status](https://travis-ci.org/twisterghost/jankbot.svg?branch=master)](https://travis-ci.org/twisterghost/jankbot)

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Running Jankbot](#running-jankbot)
4. [Adding Modules](#adding-modules)
5. [Administrating Your Jankbot](#administrating-your-jankbot)
6. [FAQ](#faq)
7. [For Developers](#for-developers)
8. [Module API](#module-api)
9. [License](#license)

## Introduction
Jankbot is an open source module-oriented Steam bot designed to help organize
player communities. The system is open for use and devleoped with scale in mind
so that any size group can make use of it. Jankbot is designed with Dota 2 in
mind, but any gaming community should find him to be a major asset to their
group.

The Jankbot project is rapidly developing and is very welcome to pull requests.

## Installation
Jankbot was designed and developed on Linux machines. There shouldn't be any
trouble installing on a Linux distro, or OSX. **Installing and running on Windows
is possible, but unsupported** and
[requires prerequisites to be installed](https://github.com/twisterghost/jankbot/wiki/Windows-Prerequisites).
Windows does not ship with the resources to connect securely to Steam.

**[In-depth installation instructions](https://github.com/twisterghost/jankbot/wiki/Installation-&-Setup)**

### Installation TL;DR

*Please be sure you understand what you're doing if you use this summary!*

1. Install [NodeJS 0.10.0 or higher](http://nodejs.org/)
2. Make a steam account with at least one purchase on it
3. Download Jankbot's [latest release](https://github.com/twisterghost/jankbot/releases)
4. Unzip it to a folder
5. Open that folder in a terminal
6. Run `./install`
7. Run `./config` and follow the prompt

## Running Jankbot

Once you have installed and configured Jankbot and you have a Steam account
ready to go with at least one purchase, you are READY TO RUN JANKBOT, WOOHOO!

**To run Jankbot:** `./jankbot`

And that's it! Jankbot should now log in to steam and accept friend requests.
Simply add him as you would another user and he will add you back, ready to help improve your community!

## Adding Modules

Jankbot is designed to use custom modules to extend his abilities. Jankbot modules can be installed via `npm`, the node package manager. Published Jankbot modules should use the naming scheme `jankbot-MODULENAME`, so you can search [npm's registry](https://www.npmjs.com/) for Jankbot modules to install.

### Legacy Modules

To add a legacy module (a module not found on npm, designed before Jankbot 2.1.0), place the module source folder in the `bot_modules/`
directory. Jankbot will load the module next time you run the program.

### JankDota Jankbot Modules

We have a collection of modules you can add immediately at the
[Jankbot Modules Repository](https://github.com/JankGaming/jankbot-modules) on
GitHub.

## Administrating Your Jankbot

See [Administrating Your Jankbot](https://github.com/twisterghost/jankbot/wiki/Administrating-Your-Jankbot)
in the Jankbot Wiki.

## FAQ

**I'm getting errors when Jankbot attempts to log in, why?**

Be sure you have disabled Steam Guard on the account you want to use Jankbot
with. Steam Guard is the two-factor authentication system that helps to prevent
unauthorized logins, but Jankbot is not able to handle this, because it requires
you to enter a code sent to your email address.

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

## Trello

Jankbot has a [public Trello page](https://trello.com/b/4zEJvVmk/jankbot) where you can see what is
being worked on and what is being released next. If you have a Trello account, you can even vote on
cards to weigh in on what should be done next.

## For Developers

Jankbot is an open source project far more than open to pull requests. If you
are a developer and wish to contribute, code review, fix a bug or whatever,
please join in! We can only do so much alone, but together Jankbot can be
strong!

## Module API

See [The Module API](https://github.com/twisterghost/jankbot/wiki/The-Module-API)
on the Jankbot Wiki for documentation on creating your own custom modules.

### Contributing
If you would like to contribute to the Jankbot project on GitHub, fork this repo
and send pull requests. We are more than happy to review and add changes.

You may also feel free to add yourself to the `contributors` file.

## License

Jankbot is under the MIT Open Source License:

Copyright (c) 2013 Michael Barrett, JankDota.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
