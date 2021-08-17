const logger = require('../plugins/winstonplugin.js');
const toml = require('toml'); const fs = require('fs');
const {version} = require('../../package.json');

let authConfig, mainConfig; var fileData;
let authLoaded = false, mainLoaded = false;

// Check if NodeJS version is the right one BEFORE even starting.
logger.debug('System Version Diagnostics.');
logger.debug(`NodeJS: ${process.version}`);
logger.debug(`App Version: ${version}`);

const NODE_MAJOR_VERSION = process.versions.node.split('.')[0];
if (NODE_MAJOR_VERSION < 16) {
  throw new Error('Requires Node 16 (or higher)');
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

if (mainLoaded) {
  var {general} = mainConfig;
  var {globalPrefix, ownerIDs} = general;
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
module.exports.config = {globalPrefix, ownerIDs};