const logger = require('../utils/winstonLogger');
const statusUpdater = require('../plugins/statusUpdater');
const { config, credentials } = require('../handlers/bootLoader');
const { debug, dashboard } = config;
const { clientSecret, sessionSecret } = credentials;
const { enableDash, dashDomain, dashSrvPort, reportOnly } = dashboard;

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {    
		logger.info(`Logged in as ${client.user.tag}. Bot Online!`);
		clearTimeout(client.timers.apiConnectWarn);
		logger.debug('Cleared ratelimit warning timer.');
    logger.init('Running settings and data initial checks...');
    client.user.setActivity('Loading... Please wait.');
		client.application = await client.application.fetch();
    try {
      await client.settings.init();
    } catch (err) {
      logger.fatal('Failed to initialize bot settings!');
      logger.fatal(err.message); logger.debug(err.stack);
      return client.user.setActivity('Bot settings error!');
    };
		try {      
			await client.settings.guild.init(client.guilds);
			await client.data.init(client.guilds);
		} catch (error) {
			logger.error('Failed to initialize guild settings/data!');
			logger.error(error.message); logger.debug(error.stack);
      return client.user.setActivity('Guild settings error!');
		};
    logger.init('Finished final checks. Preparing commands.');
		const res = await client.utils.cmds.reloadAll(client, true);
    logger.debug(`${res.success} loaded, ${res.failed} failed.`);
		const dashConfig = {
			'debug': debug,
			'dashPort': dashSrvPort,
			'reportOnly': reportOnly,
			'clientID' : client.application.id,
			'oauthSecret' : clientSecret,
			'sessionSecret' : sessionSecret || 'ZeonX64',
			'botDomain' : (dashDomain) ? dashDomain : `https://localhost:${dashSrvPort}`,
			'callbackURL' : (dashDomain) ? `${dashDomain}/api/discord/callback` : `https://localhost:${dashSrvPort}/api/discord/callback`,
		};
		logger.debug('Loading dashboard configuration.');
		if (debug) {
			logger.debug(`Dashboard Configuration:\n${JSON.stringify(dashConfig, null, 2)}`);
		} else {
			logger.debug('Dashboard Config is hidden. Enable debug mode to reveal this.');
		};
		logger.debug('Preparing to initialize dashboard...');
		try {
			if (enableDash) {
				logger.init('Initialising dashboard service.');
				require('../dashboard/dashServer.js')(client, dashConfig);
			} else {
				logger.debug('Dashboard is disabled. Falling back to basic service pinger.');
				require('../dashboard/basicServer.js');
			};
		} catch (err) {
			logger.error('Dashboard service failed to start!');
			logger.warn('Dashboard cannot be loaded. Report this to the developers!');
			logger.debug(err.stack);
			require('../dashboard/basicServer.js');
		};
    await client.user.setActivity('Ready!');
    await client.user.setStatus('online'); statusUpdater(client);
    logger.info('CoraBot is Ready!');
	},
};