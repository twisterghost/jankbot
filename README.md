# Jankbot
A Steam chat bot, built for Dota 2, made for everyone!

Current version: 3.3.0

Maintained by [@twisterghost](http://twitter.com/twisterghost)

[![Build Status](https://travis-ci.org/twisterghost/jankbot.svg?branch=master)](https://travis-ci.org/twisterghost/jankbot)
[![bitHound Overall Score](https://www.bithound.io/github/twisterghost/jankbot/badges/score.svg)](https://www.bithound.io/github/twisterghost/jankbot)

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Running Jankbot](#running-jankbot)
4. [Adding Modules](#adding-modules)
5. [Administrating Your Jankbot](#administrating-your-jankbot)
6. [FAQ](#faq)
7. [For Developers](#for-developers)
8. [Module API](#module-api)

## Introduction
Jankbot is an open source Steam bot designed to help organize player communities.

The system was devleoped with scale in mind so that any size group 
can make use of it. Jankbot was originally designed to support Dota 2 communities,
but build so that anyone can make use of it.

## Installation

Jankbot is natively able to run on Windows, Linux and OSX.

For a point by point walkthrough of the installation process, see the 
**[in-depth installation instructions](https://github.com/twisterghost/jankbot/wiki/Installation-&-Setup)**

### Installation TL;DR

*Please be sure you understand what you're doing if you use this summary!*

1. Install [NodeJS 6.10.* LTS](https://nodejs.org/en/download/)
2. Make a steam account with at least one purchase on it
3. Download Jankbot's [latest release](https://github.com/twisterghost/jankbot/releases)
4. Unzip it to a folder
5. Open that folder in a terminal
6. Run `npm install --production`
7. Run `npm run config` and follow the prompt

## Running Jankbot

Once you have installed and configured Jankbot with a valid Steam account,
you can run Jankbot with the command:

`npm start`

Jankbot should attempt to log in, and once connected, will begin accepting friend requests.
Add him as you would another user and he will add you back.

## Adding Modules

Jankbot is designed to use custom modules to extend his abilities.

Jankbot modules can be installed via `npm`, the node package manager. 
`npm` is installed along with `node`.

Published Jankbot modules should use the naming scheme `jankbot-MODULENAME`, so you can
search [npm's registry](https://www.npmjs.com/) for Jankbot modules to install.

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

Starting with Jankbot v2.1.0, you can add modules to Jankbot using `npm`. NPM
is a database of Node.js packages.  Included among them are Jankbot modules.
Jankbot modules are prefixed with `jankbot-`, so you can [search npm for
Jankbot modules](https://www.npmjs.com/search?q=jankbot) and run `npm install
jankbot-some-module` to install the module.

For older versions of Jankbot, simply download the module and place the folder
inside of Jankbot's `bot_modules/` directory. Jankbot will auto-discover
modules on startup.

**How do I keep Jankbot running after I close the terminal?**

You may want to look into [pm2](https://github.com/unitech/pm2). It is a handy
program manager that will keep it running in the background.

**How do I update Jankbot?**

Updating Jankbot is as simple as replacing the files. Just make sure you don't
delete or overwrite any module data files like `friendslist`. Soon enough a
patch system will be put in place and Jankbot will be able to update himself.
Remember that you will need to restart Jankbot after updating.

**I'm still having trouble. How can I get help?**

Tons of ways! You can tweet/DM
[@twisterghost](http://twitter.com/twisterghost), send a reddit message to
[/u/twisterghost](http://reddit.com/u/twisterghost), or if you think it is a
problem with the code, open an issue right here on GitHub.

**I think I found a bug, or, I have a feature request!**

You can [open an issue](https://github.com/twisterghost/jankbot/issues) in this
repository. Please note that not every feature request can be acted upon, but
requests are welcome.

## For Developers

Jankbot is an open source project and is open to pull requests. If you
are a developer and wish to contribute, code review, fix a bug or whatever,
please join in!

## Module API

See [The Module API](https://github.com/twisterghost/jankbot/wiki/The-Module-API)
on the Jankbot Wiki for documentation on creating your own custom modules.

### Contributing

If you would like to contribute to the Jankbot project on
GitHub, fork this repo and send pull requests to the `master` branch.

You may also feel free to add yourself to the `contributors` file.
