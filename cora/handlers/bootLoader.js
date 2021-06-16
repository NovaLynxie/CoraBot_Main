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

const authConfig = configLoader("./settings/auth.toml");
const mainConfig = configLoader("./settings/main.toml");

const {credentials} = authConfig;
const {botToken, yiffyApiKey, cheweyApiToken, youtubeApiKey} = credentials;

// check if defined, otherwise fallback to process.env.<var>
if (!botToken) botToken = process.env.botToken;
if (!yiffyApiKey) yiffyApiKey = process.env.yiffyApiKey;
if (!cheweyApiToken) cheweyApiToken = process.env.cheweyApiToken;
if (!youtubeApiKey) youtubeApiKey = process.env.youtubeApiKey;

const {general, runtime} = mainConfig; // runtime is currently unused.
const {prefix, debug} = general;

// Load bot assets from folders as necessary.
logger.init('Loading bot assets...')
const { activities } = require('../assets/json/activities.json');
logger.debug('Loaded activities from activities.json');
const { responses } = require('../assets/json/responses.json');
logger.debug('Loaded responses from responses.json');

module.exports.assets = { activities, responses };
module.exports.config = { prefix, debug};
module.exports.tokens = { botToken, yiffyApiKey, cheweyApiToken, youtubeApiKey }
