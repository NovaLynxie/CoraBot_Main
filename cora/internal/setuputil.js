const fs = require('fs');
const prompt = require('prompt');
const {version} = require('../../package.json')

console.log('Setup Utility');

const properties = [
  {
    name: 'token',
    warning: 'Missing token!'
  }
];

prompt.start();

let configPaths = {
  mainConfig: './corabot.toml',
  authConfig: './auth.toml'
}

let configMainTemplate = `
# CoraBot Main Configuration

[general]
# Bot general settings.
# Set the bot's global prefix for commands and other options here.
prefix = "<PREFIX>"
# Bot debug mode. [WARNING! This is a DEVELOPER only setting!]
# Use this only for debugging the bot as this reveals sensitive data!
debug = false

[modules]
`
let configAuthTemplate = `
[tokens]
# Discord API token. Required for bot to interact with Discord's API.
# ALWAYS KEEP THIS SECURE! NEVER SHARE WITH ANYONE!
botToken='${discordToken}'
# API Keys
yiffyApiKey='${yiffyApiKey}'

`

function settingsWriter

prompt.get(properties, function (err, result) {
  if (err) { return onErr(err); }
  
  }
});