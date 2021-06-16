const fs = require('fs');
const {mkdir, writeFile} = fs;
const prompt = require('prompt');
//const logger = require('../providers/WinstonPlugin');

console.log('Setup Utility');

const schema = {
  properties: {
    useDotEnv: {
      description: 'Use environment variables?'
      message: 'are you sure?',
      validator: /y[es]*|n[o]?/,
      warning: 'Must respond yes or no',
      default: 'no'
    }
    // Discord bot configuration.
    botToken: {
      description: "Discord Bot Token",
      message: "Discord bot token is required for code to function.",
      type: 'string',
      hidden: true,
      replace: '*',
      required: true
    },
    botPrefix: {
      description: "Set bot's unique prefix (optional)",
      message: "No prefix  was provided. Falling back to default prefix 'c'.",
      default: 'c'
    },
    // Additional credentials.
    cheweyApiKey : {
      description: "Enter valid cheweybot api token (press enter to skip)",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      replace: '*',
      default: ''
    },
    yiffyApiKey : {
      description: "Enter valid yiffy api token (press enter to skip)",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      replace: '*',
      default: ''
    },
    youtubeApiKey : {
      description: "Enter valid youtube api token (press enter to skip)",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      replace: '*',
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
  console.log('Generating auth config from template...');
  console.log('Generating main config from template...');
  //
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
    };
    authCfgData = authCfgData.replace(regex, value);
  });
  mainCfgRegex.forEach(regex => {
    var value;
    switch(regex) {
      case "<PREFIX>":
        value = (result.botPrefix || result.botPrefix==='') ? 'c' : result.botPrefix;
        break;
      default:
        console.warn('missing.item.error');
    };
    mainCfgData = mainCfgData.replace(regex, value);
  });
  setTimeout(function(){
    settingsWriter(authCfgPath, authCfgData)
  }, 500);
  setTimeout(function(){
    settingsWriter(mainCfgPath, mainCfgData)
  }, 1000);
});