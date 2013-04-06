# Jankbot
A Steam bot for Dota 2 communities

## Introduction
Jankbot is an open source module-oriented Steam bot designed to help organize
player communities. The system is open for use and devleoped with scale in mind
so that any size group can make use of it. Jankbot is written in NodeJS.

## Installation
You will need:
* NodeJS v0.10.x or higher
* NPM (comes with node)
* A Steam account with full privilages

Keep in mind that in order to have a full privilaged Steam account, you must
make at least one transaction on the account. If you do not do this, you will
not be able to add the bot to your friends list.

To begin, download the Jankbot source. Using a terminal, cd into the source
directory and run `npm install`.

**NOTE:** You may have issues installing the node packages for Steam. It is
recommended that you use a linux operating system and use NodeJS v0.10.x

Once the packages are installed, you will need to set up the config file.
Create a file called `config.json` and use this template:

```javascript
{
  "username": "your_bot_account_username",
  "password": "your_bot_account_password",
  "admins" : [],
  "modules" : [
  ],
  "displayName" : "Jankbot"
}
```

Once you edit the config file with the proper username and password, you're set!
Run your newly installed Jankbot with `node jankbot` and you should be ready to
roll!
