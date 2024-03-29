const logger = require('./utils/winstonLogger');
const { embeds } = require('./utils/botEmbeds');
const { utils } = require('./utils/botUtils');
const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { cmdLoader } = require('./handlers/cmdLoader');
const { crashReporter } = require('./handlers/crashReporter');
const { storage } = require('./handlers/storeManager');
const { voice } = require('./handlers/voiceManager');
const { config, credentials } = require('./handlers/bootLoader');
const { ownerIDs, useLegacyURL, debug, modules } = config;
const { discordToken } = credentials;
logger.init('Preparing bot client...');
const client = new Client({
  owners: ownerIDs,
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES
  ],
  presence: { status: 'dnd', activities: [{ name: 'Initializing...' }] }
});
client.commands = new Collection();
client.voice.player = voice;
client.data = storage.data;
client.settings = storage.settings;
client.modules = modules;
client.utils = { ...utils, cmds: cmdLoader, embeds: embeds };
if (useLegacyURL) {
  logger.warn('Legacy API domain is now deprecated. Only use this to debug app connections.');
  logger.debug('Switching http API to legacy domain.');
  client.options.http.api = 'https://discordapp.com/api';
} else { logger.debug('Using default API domain.') };
const eventFiles = readdirSync('./lib/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  };
};
process.on('unhandledRejection', error => {
  logger.warn('Uncaught Promise Rejection Exception thrown!');
  if (error.name) logger.debug(`${error.name}`);
  if (error.code) logger.debug(`Code: ${error.code}`);
  if (error.path) logger.debug(`Path: ${error.path}`);
  if (error.method) logger.debug(`Method? ${error.method}`);
  logger.debug(`Caused by: ${error.message}`);
  logger.debug(error.stack);
});
process.on('uncaughtException', error => {
  logger.error('Bot crashed! Generating a crash report.');
  logger.error(error.message); logger.debug(error.stack);
  crashReporter(error); setTimeout(() => process.exit(1), 5000);
});
const apiConnectWarn = setTimeout(() => {
  logger.warn('Bot taking longer than normal to connect.');
  logger.warn('Possibly slow connection or rate limited?');
}, 30 * 1000);
const dbServiceWorker = setInterval(async () => {
  try {
    await client.utils.db.backup();
  } catch (error) {
    logger.debug(error.stack);
  };
}, 3600 * 1000);
client.timers = { apiConnectWarn, dbServiceWorker };
logger.init('Connecting to Discord...');
client.login(discordToken).then(() => {
  logger.debug('Awaiting API Response...');
}).catch((error) => {
  clearTimeout(client.timers.apiConnectWarn);
  logger.warn('Unable to connect to Discord!');
  logger.error(error.message); logger.debug(error.stack);
});