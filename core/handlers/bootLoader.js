const logger = require('../utils/winstonLogger');
const toml = require('toml'); const fs = require('fs');
const { version } = require('../../package.json');
let authConfig, mainConfig, fileData;
let authLoaded = false, mainLoaded = false;
logger.debug('==========================================================');
logger.debug('System Version Diagnostics.');
logger.debug(`NodeJS v${process.versions.node}`);
logger.debug(`CoraBot v${version}`);
logger.debug('==========================================================');
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
if (forceUpdateCmds) {
  logger.warn('forceUpdateCmds detected as ENABLED!')
  logger.warn('Bot restart is recommended after commands update!');
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
	discordToken = (!discordToken || discordToken === 'NOT_SET') ? process.env.discordToken : discordToken;
	clientSecret = (!clientSecret || clientSecret === 'NOT_SET') ? process.env.clientSecret : clientSecret;
	sessionSecret = (!sessionSecret || sessionSecret === 'NOT_SET') ? process.env.sessionSecret : sessionSecret;
	cheweyApiToken = (!cheweyApiToken || cheweyApiToken === 'NOT_SET') ? process.env.cheweyApiToken : cheweyApiToken;
	yiffyApiKey = (!yiffyApiKey || yiffyApiKey === 'NOT_SET') ? process.env.yiffyApiKey : yiffyApiKey;
	youtubeApiKey = (!youtubeApiKey || youtubeApiKey === 'NOT_SET') ? process.env.youtubeApiKey : youtubeApiKey;
  soundcloudClientID = (!soundcloudClientID || soundcloudClientID === 'NOT_SET') ? process.env.soundcloudClientID : soundcloudClientID;
} else {
	var {
		discordToken, clientSecret, sessionSecret, cheweyApiToken, yiffyApiKey, youtubeApiKey, soundcloudClientID
	} = process.env;
};
module.exports.credentials = { discordToken, clientSecret, sessionSecret, cheweyApiToken, yiffyApiKey, youtubeApiKey, soundcloudClientID };
module.exports.config = { globalPrefix, ownerIDs, useLegacyURL, forceUpdateCmds, debug, dashboard };
module.exports.deploy = { clientId, guildId };