const fs = require('fs');
const { stripIndents } = require('common-tags');
const { mkdir, writeFile } = fs;
const prompt = require('prompt');

console.log('Welcome to the Bot Setup Utility!');
console.log('This setup utility will help you configure your bot credentials and basic setup.')
console.log('Please follow the prompts to set up your bot.')
console.log('---------------------------------------------')
const schema = {
  properties: {
    // Setup credentials with env vars or toml config.
    credStore: {
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
      message: "No prefix was provided. Falling back to default prefix 'z!'.",
      default: 'z!'
    },
    // Dashboard credentials/configuration.
    clientSecret: {
      description: "Discord Client Secret",
      warning: "This is required for OAuth code grants! Dashboard won't function correctly!",
      hidden: true,
      replace: '*',
      required: false
    },
    sessionSecret: {
      description: "Dashboard Session Secret",
      message: "No session secret was set Using 'CoraBot' as secret.",
      type: 'string',
      default: 'CoraBot'
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
    yiffyApiToken : {
      description: "Enter valid yiffy api token (press enter to skip)",
      message: "No valid token provided! Some modules will not function correctly.",
      type: 'string',
      hidden: true,
      replace: '*',
      default: ''
    },
    youtubeApiToken : {
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
let dataDir = './data/storage', settingsDir = './settings';
let authCfgPath = `${settingsDir}/auth.toml`, dirEnvPath = './.env', mainCfgPath = `${settingsDir}/main.toml`;

// setup utilities functions
function generateDirectory(targetDir) {
  mkdir(targetDir, { recursive: true }, (err) => {
    if (err) {
      if (err.code === 'EEXIST') {
        return console.warn('Directory already exists!');
      } else {
        console.error(`${err.code} ${err.message}`);
      };
    };
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
};

// run this to check if directory exists. if not, generate it.
generateDirectory(dataDir); generateDirectory(settingsDir);

// prepare the configuration templates from local files.
// load the authentication configuration template.
let authCfgTemplate = fs.readFileSync('./core/assets/text/authConfigTemplate.txt', 'utf-8');
// load the main bot configuration template.
let mainCfgTemplate = fs.readFileSync('./core/assets/text/mainConfigTemplate.txt', 'utf-8');

// start fetching console inputs.
prompt.get(schema, function (err, result) {
  console.log('\n---------------------------------------------')
  if (err) return promptError(err);
  // prepare configuration data from templates.
  let authCfgData = authCfgTemplate, mainCfgData = mainCfgTemplate;
  console.log('Generating auth config from template...');
  console.log('Generating main config from template...');
  // prepare configuration regex to replace.
  let authCfgRegex = [
    "<DISCORDTOKEN>", "<CLIENTSECRET>", "<SESSIONSECRET>", "<YIFFYAPIKEY>","<CHEWEYAPITOKEN>","<YOUTUBEAPIKEY>"
  ];
  let mainCfgRegex = [
    "<PREFIX>", "<DOTENV>"  
  ];
  // start running regex.  
  console.log('Preparing auth configuration.');
  authCfgRegex.forEach(regex => {
    var value;
    switch(regex) {
      case "<DISCORDTOKEN>":
        value = (!result.botToken || !result.botToken==='') ? 'NOT_SET' : result.botToken;
        break;
      case "<CLIENTSECRET>":
        value = (!result.clientSecret || !result.clientSecret==='') ? 'NOT_SET' : result.clientSecret;
        break;
      case "<SESSIONSECRET>":
        value = (!result.sessionSecret || !result.sessionSecret==='') ? 'NOT_SET' : result.sessionSecret;
        break;
      case "<CHEWEYAPITOKEN>":
        value = (!result.cheweyApiKey || !result.cheweyApiKey==='') ? 'NOT_SET' : result.cheweyApiKey;
        break;
      case "<YIFFYAPIKEY>":
        value = (!result.yiffyApiKey || !result.yiffyApiKey==='') ? 'NOT_SET' : result.yiffyApiKey;
        break;
      case "<YOUTUBEAPIKEY>":
        value = (!result.youtubeApiKey || !result.youtubeApiKey==='') ? 'NOT_SET' : result.youtubeApiKey;
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
        value = (result.botPrefix) ? result.botPrefix : 'z?';
        break;
      case "<DOTENV>":
        value = (result.credStore.match(/e[nv]/gi)) ? true : false;
        break;
      default:
        console.warn('missing.item.error');
    };
    mainCfgData = mainCfgData.replace(regex, value);
  });
  console.log('Main configuration ready!');
  // check if credStore is env or toml.
  if (result.credStore.match(/e[nv]/gi)) {
    // generate env data file then write to file.
    let botEnvData = stripIndents`# lynxbot process environment variables
    discordToken=${result.botToken}
    clientSecret=${result.clientSecret}
    sessionSecret=${result.sessionSecret}
    cheweyApiToken=${result.cheweyApiKey}
    yiffyApiKey=${result.yiffyApiToken}
    youtubeApiKey=${result.youtubeApiToken}`
    settingsWriter(dirEnvPath, botEnvData);
  } else 
  if (result.credStore.match(/t[oml]/gi)) {
    // use settings writer to parse to file.
    settingsWriter(authCfgPath, authCfgData);
  }
  settingsWriter(mainCfgPath, mainCfgData);
});
