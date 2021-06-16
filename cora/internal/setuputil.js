const fs = require('fs');
const {mkdir, writeFile} = fs;
const prompt = require('prompt');
//const logger = require('../providers/WinstonPlugin');

console.log('Welcome to the CoraBot Setup Utility!');
console.log('This setup utility will help you configure your bot credentials and basic setup.')
console.log('Please follow the prompts to set up your bot.')
console.log('---------------------------------------------')
const schema = {
  properties: {
    // Setup credentials with env vars or toml config.
    useDotEnv: {
      description: 'Credential Storage',
      message: 'Store credentials in DotEnv or TOML?',
      validator: /e[nv]*|t[oml]?/,
      warning: "Please choose env or toml to store credentials.",
      default: 'toml'
    },
    // Discord bot configuration.
    botToken: {
      description: "Discord Bot Token",
      warning: "Discord bot token is required for code to function.",
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
    return console.warn('\nSetup has been cancelled!');
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
  console.log('\n---------------------------------------------')
  if (err) return promptError(err);
  // prepare configuration data from templates.
  let authCfgData = authCfgTemplate, mainCfgData = mainCfgTemplate;
  console.log('Generating auth config from template...');
  console.log('Generating main config from template...');
  // prepare configuration regex to replace.
  let authCfgRegex = ["<DISCORDTOKEN>","<YIFFYAPIKEY>","<CHEWEYAPITOKEN>","<YOUTUBEAPIKEY>"];
  let mainCfgRegex = ["<PREFIX>", "<DOTENV>"];
  // check if useDotEnv is yes or no.
  if (result.useDotEnv === 'yes') {
    // not implemented
  } else {
    // not implemented
  }
  // start running regex.  
  console.log('Preparing auth configuration.');
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
  console.log('Auth configuration ready!');
  console.log('Preparing main configuration.');
  mainCfgRegex.forEach(regex => {
    var value;
    switch(regex) {
      case "<PREFIX>":
        value = (result.botPrefix || result.botPrefix==='') ? 'c' : result.botPrefix;
        break;
      case "<DOTENV>":
        value = (result.useDotEnv === 'yes') ? true : false;
        break;
      default:
        console.warn('missing.item.error');
    };
    mainCfgData = mainCfgData.replace(regex, value);
  });
  console.log('Main configuration ready!');
  settingsWriter(authCfgPath, authCfgData);
  settingsWriter(mainCfgPath, mainCfgData);
});