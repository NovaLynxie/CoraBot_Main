const fs = require('fs');
const prompt = require('prompt');
const {version} = require('../../package.json')

console.log('Setup Utility');

var schema = {
  properties: {
    name: {
      pattern: /^[a-zA-Z\s\-]+$/,
      message: 'Name must be only letters, spaces, or dashes',
      required: true
    },
    password: {
      hidden: true
    }
  }
};

const schema = {
  properties: {
    botToken: {
      description: "Please enter your bot's unique token.",
      message: "Discord bot token required for code to function.",
      type: 'string',
      hidden: true,
      required: true
    },
    botPrefix: {
      description: "Enter your bot's default prefix, or press enter to use default.",
      message: "No prefix  was provided. Falling back to default prefix 'c'.",
      default: 'c'
    }
  }
};

prompt.start();

let configPaths = {
  mainConfig: './corabot.toml',
  authConfig: './auth.toml'
}

function settingsWriter(data) {
  
}

function promptError(err) {
  logger.error('Something went wrong while running the utility!')
  logger.error(err);
}

let discordToken, yiffyApiKey, cheweyApiToken, youtubeApiKey;

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
# ALWAYS KEEP THESE SECURE! NEVER SHARE WITH ANYONE!
# If they are leaked, regenerate a new one as soon as possible.
[credentials]
# Discord API token. Required for bot to interact with Discord's API.
botToken='${botToken}'
# API Keys. Used to authenticate access to modules using these resources.
# Yiffy API -> Obtain key here [to be confirmed]
yiffyApiKey='${yiffyApiKey}' -> 
# CheweyBot API -> Obtain key here [https://discord.gg/ubHYJ7w]
cheweyApiToken='${cheweyApiToken}'
# Youtube Data API -> Setup your key at Google Cloud Dashboard.
youtubeApiKey='${youtubeApiKey}'
`
prompt.get(schema, function (err, result) {
  if (err) { return promptError(err); }
  botToken = result.botToken;
});