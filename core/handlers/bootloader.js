const logger = require('../plugins/winstonplugin.js');
const toml = require('toml'); const fs = require('fs');
const {version} = require('../../package.json');

let authConfig, mainConfig; var fileData;
let authLoaded = false, mainLoaded = false;

// Display version information here for easier diagnostics.
logger.debug('==========================================================');
logger.debug('System Version Diagnostics.');
logger.debug(`NodeJS: v${process.versions.node}`);
logger.debug(`App Version: v${version}`);
logger.debug('==========================================================');
// Check if NodeJS version is the right one BEFORE even starting.
const NODE_MAJOR_VERSION = process.versions.node.split('.')[0];
const NODE_MINOR_VERSION = process.versions.node.split('.')[1];
if (NODE_MAJOR_VERSION < 16 || NODE_MINOR_VERSION < 6) {
  logger.fatal('This app requires NodeJS v16.6.0 or higher to work correctly!');
  throw new Error('Requires Node 16.6.0 (or higher)');
};

try {
  fileData = fs.readFileSync('./settings/auth.toml', 'utf-8');
  authConfig = toml.parse(fileData);
  authLoaded = true;
} catch (err) {
  logger.error('Failed to load auth.toml configuration!');
  logger.error(err.message); logger.debug(err.stack);
  logger.warn('Falling back to environment variables.');
}
try {
  fileData = fs.readFileSync('./settings/main.toml', 'utf-8');
  mainConfig = toml.parse(fileData);
  mainLoaded = true;
} catch (err) {
  logger.error('Failed to load main.toml configuration!');
  logger.error(err.message); logger.debug(err.stack);
  logger.warn('Cannot proceed with bot boot up.')
}

var general = {}; var globalPrefix = '', ownerIDs = [];
var discord = {}, discordToken = '', ytApiKey = '';
var runtime = {};

if (mainLoaded) {
  var {general, dashboard, runtime} = mainConfig;
  var {globalPrefix, ownerIDs, useLegacyURL, debug} = general;
};
if (authLoaded) {
  var {discord} = authConfig;
  var {discordToken, ytApiKey} = discord;
  if (!discordToken || discordToken === 'NOT_SET') {
    discordToken = process.env.discordToken;
  };
} else {
  discordToken = process.env.discordToken;
};

module.exports.credentials = {discordToken, ytApiKey};
module.exports.config = {globalPrefix, ownerIDs, useLegacyURL, debug, dashboard};