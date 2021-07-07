// Main boot up handler for CoraBot.
// This is used to handle loading necessary configs before bot initialises.
// DO NOT MODIFY OR REMOVE THIS FILE OTHERWISE THE BOT WILL NOT START!!!

require('dotenv').config() // load .env as early as possible
const logger = require('../providers/WinstonPlugin');
const fs = require('fs');
// Config loader (TOML Localised File Handler)
const toml = require('toml'); // Enables parsing of *.toml files

function configLoader(configPath) {
  let configData = toml.parse(
    fs.readFileSync(configPath, (err) => {
      logger.error('An error occured while loading config file!')
      logger.error(err); logger.debug(err.stack);
      logger.warn('Is the config file missing or unreadable?');
    })
  );
  return configData;
};
logger.init('Loading bot settings...')
const authConfig = configLoader("./settings/auth.toml");
logger.debug('Loaded credentials from auth.toml');
const mainConfig = configLoader("./settings/main.toml");
logger.debug('Loaded main config from main.toml');

const {credentials} = authConfig;
var {discordToken, yiffyApiKey, cheweyApiToken, youtubeApiKey} = credentials;

logger.init('Checking credentials...');
// check if defined, otherwise fallback to process.env.<var>
if (!discordToken) discordToken = process.env.discordToken;
if (!yiffyApiKey) yiffyApiKey = process.env.yiffyApiKey;
if (!cheweyApiToken) cheweyApiToken = process.env.cheweyApiToken;
if (!youtubeApiKey) youtubeApiKey = process.env.youtubeApiKey;

const {general, dashboard, runtime} = mainConfig;
const {prefix, operators, useLegacyURL, debug} = general;
const {enableDash, dashSrvPort, reportOnly} = dashboard;
const {useDotEnv} = runtime;
// If useDotEnv is enabled, attempt to get credentials from process.env instead.
if (useDotEnv) {
  ({discordToken, yiffyApiKey, cheweyApiToken, youtubeApiKey} = process.env)
};

if (debug) {
  logger.warn('Debug mode enabled! Sensitive data included in debug logs.');
  logger.data(`yiffyApiKey=${yiffyApiKey}`);
  logger.data(`cheweyApiToken=${cheweyApiToken}`);
  logger.data(`youtubeApiKey=${youtubeApiKey}`);
}

// Load bot assets from folders as necessary.
logger.init('Fetching bot assets...');
const { activities } = require('../assets/json/activities.json');
logger.debug('Loaded activities from activities.json');
const { responses } = require('../assets/json/responses.json');
logger.debug('Loaded responses from responses.json');

module.exports.assets = { activities, responses };
module.exports.config = { prefix, operators, useLegacyURL, debug, enableDash, dashSrvPort, reportOnly };
module.exports.tokens = { discordToken, yiffyApiKey, cheweyApiToken, youtubeApiKey };
