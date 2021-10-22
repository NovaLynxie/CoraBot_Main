const logger = require('../plugins/winstonLogger.js');
const toml = require('toml'); const fs = require('fs');
const { version } = require('../../package.json');

let authConfig, mainConfig; let fileData;
let authLoaded = false, mainLoaded = false;

// Display version information here for easier diagnostics.
logger.debug('==========================================================');
logger.debug('System Version Diagnostics.');
logger.debug(`NodeJS v${process.versions.node}`);
logger.debug(`CoraBot v${version}`);
logger.debug('==========================================================');
// Check if NodeJS version is the right one BEFORE even starting.
const NODE_MAJOR_VERSION = process.versions.node.split('.')[0];
const NODE_MINOR_VERSION = process.versions.node.split('.')[1];
if (NODE_MAJOR_VERSION < 16 && NODE_MINOR_VERSION < 6) {
	logger.fatal('This app requires NodeJS v16.6.0 or higher to run!');
	throw new Error('Incompatible NodeJS version!');
};
const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV || NODE_ENV !== 'production') {
  logger.warn('This app is running in development mode!');
  logger.warn('Performance may be heavily impacted in this mode.');
};

logger.init('Loading configuration files...');
try {
	fileData = fs.readFileSync('./settings/main.toml', 'utf-8');
	mainConfig = toml.parse(fileData);
	mainLoaded = true;
} catch (err) {
	logger.error('Failed to load main.toml configuration!');
	logger.error(err.message); logger.debug(err.stack);
	logger.warn('Cannot proceed with bot boot up.');
};

var general = {}, discord = {}, runtime = {};
var discordToken, clientSecret, sessionSecret, cheweyApiToken, yiffyApiKey, youtubeApiKey, soundcloudClientID;

if (mainLoaded) {
	var { general, advanced, dashboard, runtime } = mainConfig;
	var { globalPrefix, ownerIDs, useLegacyURL } = general;
	var { clientId, guildId, debug } = advanced;
	var { useDotEnv, forceUpdateCmds } = runtime;
};

logger.init('Loading bot credentials...');
if (useDotEnv) {
	var {
		discordToken,
		clientSecret,
		sessionSecret,
		cheweyApiToken,
		yiffyApiKey,
		youtubeApiKey,
    soundcloudClientID
	} = process.env;
} else {
	try {
		fileData = fs.readFileSync('./settings/auth.toml', 'utf-8');
		authConfig = toml.parse(fileData);
		authLoaded = true;
	} catch (err) {
		logger.error('Failed to load auth.toml configuration!');
		logger.error(err.message); logger.debug(err.stack);
		logger.warn('Falling back to environment variables.');
	};
};

if (authLoaded) {
	var { discord, external } = authConfig;
	var { discordToken, clientSecret, sessionSecret } = discord;
	var { cheweyApiToken, yiffyApiKey, youtubeApiKey, soundcloudClientID } = external;
	// check main credentials and fallback to process.env if missing.
	discordToken = (!discordToken || discordToken === 'NOT_SET') ? process.env.discordToken : discordToken;
	clientSecret = (!clientSecret || clientSecret === 'NOT_SET') ? process.env.clientSecret : clientSecret;
	sessionSecret = (!sessionSecret || sessionSecret === 'NOT_SET') ? process.env.sessionSecret : sessionSecret;
	// check other credentials and fallback to process.env if missing.
	cheweyApiToken = (!cheweyApiToken || cheweyApiToken === 'NOT_SET') ? process.env.cheweyApiToken : cheweyApiToken;
	yiffyApiKey = (!yiffyApiKey || yiffyApiKey === 'NOT_SET') ? process.env.yiffyApiKey : yiffyApiKey;
	youtubeApiKey = (!youtubeApiKey || youtubeApiKey === 'NOT_SET') ? process.env.youtubeApiKey : youtubeApiKey;
  soundcloudClientID = (!soundcloudClientID || soundcloudClientID === 'NOT_SET') ? process.env.soundcloudClientID : soundcloudClientID;
} else {
	var {
		discordToken, clientSecret, sessionSecret, cheweyApiToken, yiffyApiKey, youtubeApiKey,
	} = process.env;
};
module.exports.credentials = { discordToken, clientSecret, sessionSecret, cheweyApiToken, yiffyApiKey, youtubeApiKey };
module.exports.config = { globalPrefix, ownerIDs, useLegacyURL, forceUpdateCmds, debug, dashboard };
module.exports.deploy = { clientId, guildId };