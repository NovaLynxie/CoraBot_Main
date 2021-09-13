const logger = require('../plugins/winstonLogger');
const { loadBotCmds } = require('../handlers/cmdLoader');
const { config, credentials } = require('../handlers/bootLoader');
const { debug, dashboard } = config;
const { clientSecret, sessionSecret } = credentials;
const { enableDash, dashDomain, dashSrvPort, reportOnly } = dashboard;
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		logger.info(`Logged in as ${client.user.tag}. Bot Online!`);
		logger.warn('Running final checks! Bot may be slow for a bit.');
		clearTimeout(client.timers.rateLimitWarn);
		logger.debug('Cleared ratelimit warning timer.');
		// Fetch application information.
		client.application = await client.application.fetch();
		// Check settings database.
		await client.settings.init();
		const guilds = client.guilds.cache.map(g => g.id);
		try {
			logger.init('Running settings and data initial checks...');
			await client.settings.guild.init(guilds);
			await client.data.init(guilds);
			logger.info('Finished final checks. Preparing commands.');
		}
		catch (err) {
			logger.error('Failed to initialize guild settings/data!');
			logger.error(err.message); logger.debug(err.stack);
			logger.error('Encountered some errors during bot post start.');
			logger.warn('Please check logs before restarting the bot.');
		}
		// Load commands here using the client's unique ID.
		loadBotCmds(client);
		// Prepare configuration for the dashboard service.
		const dashConfig = {
			'debug': debug, // used to enable debug console log data.
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
		}
		else {
			logger.debug('Dashboard Config is hidden. Enable debug mode to reveal this.');
		}
		logger.debug('Preparing to initialize dashboard...');
		// Start dashsrv to handle heartbeat ping requests. (eg. UptimeRobot)
		try {
			if (enableDash) {
				logger.init('Initialising dashboard service.');
				require('../dashboard/dashsrv.js')(client, dashConfig);
			}
			else {
				logger.debug('Dashboard is disabled. Falling back to basic service pinger.');
				require('../dashboard/basicsrv.js');
			}
		}
		catch (err) {
			// fallback to basicsrv silently if fails.
			logger.error('Dashboard service failed to start!');
			logger.warn('Dashboard cannot be loaded. Report this to the developers!');
			logger.debug(err.stack);
			require('../dashboard/basicsrv.js');
		}
	},
};