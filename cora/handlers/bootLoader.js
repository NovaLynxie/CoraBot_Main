// Main init handler for CoraBot.
// This is used to handle loading necessary configs before bot initialises.
// DO NOT MODIFY OR REMOVE THIS FILE OTHERWISE THE BOT WILL NOT START!!!
require('dotenv').config() // load .env as early as possible
const logger = require('../providers/WinstonPlugin');
const fs = require('fs');
// Config loader (TOML Localised File Handler)
const toml = require('toml'); // Enables parsing of *.toml files
const configData = toml.parse(fs.readFileSync('./config.toml', function (err){
  logger.error(`Error while reading file...`)
  logger.error(err)
  logger.debug(err.stack)
  logger.warn(`Is file missing or unreadable?`)
}));
// Load config data from config.toml file.
//const { discordbot, dashboard } = config; 
//global dashboard setting depreciated, moved to discordbot.dashboard
const { version } = require('../../package.json');
const { general, chatbot, images, autoLogger, autoModerator, dashboard } = configData;
const { prefix, debug } = general;
const { enableChatBot, chatChannels } = chatbot;
const { enableLogger, logChannels, ignoredChannels, logEvents } = autoLogger;
const { messageUpdates, userJoinLeaves, roleUpdates } = logEvents;
const { enableAutoMod, chListMode, channelsList, urlBlacklist, urlWhitelist, mediaOptions } = autoModerator;
const { clientName, yiffyApiKey } = images;
//const { port } = dashboard; // Currently disabled in this branch.
logger.debug(`prefix = ${prefix} (${typeof prefix})`);
logger.debug(`debug = ${debug} (${typeof debug})`);
logger.debug(`enabled = null (null)`);
//logger.debug(`port = ${port} (${typeof port})`);
logger.debug(`logChannels = ${logChannels}, ignoredChannels = ${ignoredChannels}`);
logger.debug('Loaded config successfully!');
if (debug === true) {
  logger.warn('DEBUG mode enabled!');
  logger.warn('Sensitive data will be logged in debug log file.');
};
function randomID(min, max) {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
};
if (!clientName||clientName==undefined) {
  logger.warn(`Variable 'clientName' was undefined or not provided, it might not have been set correctly.`);
  logger.warn('This may cause bot commands using it to fail or requests blocked if not defined.');
  var tempID = randomID(1000,9999);
  clientName = `botUser${tempID}`;
  logger.warn('Attempting to use a temporary client name for this session, this is not recommended!');
}
logger.debug(`Set clientName as ${clientName} for this session.`);
// Configure image user agents. 
var eImg = { // Required to use e621 and e926 modules.
  "creator":"NovaLynxie", // The bot's creator
  "name": `${clientName}`, // User defined in configuration file
  "version":`${version}`  // Version of the bot defined in package.json
};
// Yiffy UserAgent for CoraBot. Required otherwise it will fail to work correctly.
const myUserAgent = `CoraBot/${version} (https://github.com/NovaLynxie/CoraBot_ReplIt)`
// Load bot secrets from process.env if this fails use config vars.
var { botToken, ownerID } = process.env;
logger.debug('Loaded process environment variables!');
// Generate some folders on bot startup.
let dirpaths = ['./cora/cache/automod/','./cora/cache/mcsrvutil/']
dirpaths.forEach(async (dirpath) => {
  await fs.mkdir(dirpath, {recursive: true}, function (err) {
    if (err) {
      if (err.code === 'ENOENT') {
        logger.debug(`Missing directory ${dirpath}! Generating now...`)
      } else {
        logger.debug(`Could not make directory or another problem occured.`)
        logger.debug(err.stack)
      }
    };
  })
})
// Load bot assets from folders as necessary.
logger.init('Loading bot assets...')
const { activities } = require('../assets/json/activities.json');
logger.debug('Loaded activities from activities.json');
const { responses } = require('../assets/json/responses.json');
const { log } = require('util');
logger.debug('Loaded responses from responses.json');
// Finally export all variables for the bot to access by requiring bootLoader.js
module.exports.config = {prefix, debug, botToken, ownerID, eImg, myUserAgent, yiffyApiKey, version}; // bot config
module.exports.chatty = {enableChatBot, chatChannels} // chatbot settings
module.exports.autoMod = {enableAutoMod, chListMode, channelsList, urlBlacklist, urlWhitelist, mediaOptions}; // bot automod settings
module.exports.autoLog = {enableLogger, logChannels, ignoredChannels, messageUpdates, userJoinLeaves, roleUpdates}; // bot autolog settings
module.exports.assets = {activities, responses}; // bot asset data