const fs = require('fs');
const {mkdir, writeFile} = fs;
const prompt = require('prompt');
//const logger = require('../providers/WinstonPlugin');

console.log('Setup Utility');

const schema = {
  properties: {
    // Discord bot configuration.
    botToken: {
      description: "Please enter your bot's unique token.",
      message: "Discord bot token is required for code to function.",
      type: 'string',
      hidden: true,
      required: true
    },
    botPrefix: {
      description: "Enter your bot's default prefix, or press enter to use default.",
      message: "No prefix  was provided. Falling back to default prefix 'c'.",
      default: 'c'
    },
    // Additional credentials.
    cheweyApiKey : {
      description: "Please enter a valid cheweybot api token or press enter to skip this step",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      default: ''
    },
    yiffyApiKey : {
      description: "Please enter a valid yiffy api token or press enter to skip this step",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      default: ''
    },
    youtubeApiKey : {
      description: "Please enter a valid youtube api token or press enter to skip this step",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      default: ''
    }
  }
};

// initiate prompt module to begin getting input from command line.
prompt.start();

// define paths here.
let settingsDir = './settings';
let authCfgPath = `${settingsDir}/auth.toml`, mainCfgPath = `${settingsDir}/main.toml`;

// setup utilities functions
function generateDirectory(targetDir) {
  mkdir(targetDir, { recursive: true }, (err) => {
    if (err) {
      console.error('An error occured while creating directory paths!');
      console.error(err);
    }
  });
};
function settingsWriter(path, data) {
  writeFile(path, data, (err) => {
    console.info(`Writing config data to ${path}...`);
    if (err) {
      console.error(`Failed to write to file at ${path}!`);
      console.error(err); console.debug(err.stack);
    } else {
      console.info(`Saved config to ${path}.`);
    }
  })
};
function promptError(err) {
  if (err.message.indexOf('canceled') > -1) {
    return console.warn('Setup has been cancelled!');
  } else {
    console.error('Something went wrong during setup process!');
    console.error(err); 
    console.debug(err.stack);
  };
}

// run this to check if directory exists. if not, generate it.
generateDirectory(settingsDir);

// prepare the configuration templates from local files.
// load the authentication configuration template.
let authCfgTemplate = fs.readFileSync('./cora/assets/text/authConfigTemplate.txt', 'utf-8');
// load the main bot configuration template.
let mainCfgTemplate = fs.readFileSync('./cora/assets/text/mainConfigTemplate.txt', 'utf-8');

// start fetching console inputs.
prompt.get(schema, function (err, result) {
  if (err) return promptError(err);
  // prepare configuration data.
  let authCfgData = authCfgTemplate, mainCfgData = mainCfgTemplate;
  let authCfgRegex = ["<DISCORDTOKEN>","<YIFFYAPIKEY>","<CHEWEYAPITOKEN>","<YOUTUBEAPIKEY>"];
  let mainCfgRegex = ["<PREFIX>"];
  authCfgRegex.forEach(regex => {
    var value;
    switch(regex) {
      case "<DISCORDTOKEN>":
        value = result.botToken;
        break;
      case "<CHEWEYAPITOKEN>":
        value = (result.cheweyApiKey || result.cheweyApiKey==='') ? 'NOT_SET' : result.cheweyApiKey;
        break;
      case "<YIFFYAPIKEY>":
        value = (result.yiffyApiKey || result.yiffyApiKey==='') ? 'NOT_SET' : result.yiffyApiKey;
        break;
      case "<YOUTUBEAPIKEY>":
        value = (result.youtubeApiKey || result.youtubeApiKey==='') ? 'NOT_SET' : result.youtubeApiKey;
        break;
      default:
        console.warn('missing.item.error');
    }
    authCfgData = authCfgData.replace(regex, value);
  });
  settingsWriter(authCfgPath, authCfgData);
  mainCfgRegex.forEach(regex => {
    var value;
    switch(regex) {
      case "<PREFIX>":
        value = (result.botPrefix || result.botPrefix==='') ? 'c' : result.botPrefix;
        break;
      default:
        console.warn('missing.item.error');
      mainCfgData = mainCfgData.replace(regex, value);
    }
  })
  settingsWriter(mainCfgPath, mainCfgData);
});