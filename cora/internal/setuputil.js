const fs = require('fs');
const prompt = require('prompt');
const logger = require('../providers/WinstonPlugin');
const {version} = require('../../package.json');

console.log('Setup Utility');

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
  authConfig: './auth.toml',
  mainConfig: './main.toml'  
}

function settingsWriter(data) {
  fs.write()
}

function promptError(err) {
  if (err.message.indexOf('canceled') > -1) {
    return logger.warn('Setup has been cancelled!');
  } else {
    logger.error('Something went wrong during setup process!');
    logger.error(err); 
    logger.debug(err.stack);
  };
}

let cfgMainTml = `
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
let cfgAuthTml = `
# ALWAYS KEEP THESE SECURE! NEVER SHARE WITH ANYONE!
# If they are leaked, regenerate a new one as soon as possible.
[credentials]
# Discord API token. Required for bot to interact with Discord's API.
botToken='<DISCORDTOKEN>'
# API Keys. Used to authenticate access to modules using these resources.
# Yiffy API -> Obtain key here [to be confirmed]
yiffyApiKey='<YIFFYAPIKEY>' -> 
# CheweyBot API -> Obtain key here [https://discord.gg/ubHYJ7w]
cheweyApiToken='<CHEWEYAPITOKEN>'
# Youtube Data API -> Setup your key at Google Cloud Dashboard.
youtubeApiKey='<YOUTUBEAPIKEY>'
`
prompt.get(schema, function (err, result) {
  if (err) { return promptError(err); }
  // load primary configuration first.
  token = result.botToken;
  prefix = result.botPrefix;
  // load extra credentials next.
  /* Not yet setup!
  cheweyApiKey = result.cheweyApiKey;
  yiffyApiKey = result.yiffyApiKey;
  youtubeApiKey = result.youtubeApiKey;
  */
  let cfgAuthData = cfgAuthTml, cfgMainData = cfgMainTml;
  let authRegexList = ["<DISCORDTOKEN>","<YIFFYAPIKEY>","<CHEWEYAPITOKEN>","<YOUTUBEAPIKEY>"];
  let mainRegexList = ["<PREFIX>"];
  authRegexList.forEach(regex => {
    cfgAuthData = cfgAuthData.replace(regex, )
  })
  configAuthTemplate = configAuthTemplate.replace()
  //let authCfgData = prepareAuthConfig({token});
  //let mainCfgData = prepareMainConfig({prefix});
});