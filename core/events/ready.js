const logger = require('../plugins/winstonlogger');
const { loadPrefixCmds, loadSlashCmds } = require('./core/handlers/cmdloader');
const { config, credentials } = require('../handlers/bootloader');
const { debug, dashboard } = config;
const { clientSecret, sessionSecret } = credentials;
const { enableDash, dashDomain, dashSrvPort, reportOnly } = dashboard;
const { storeHandler } = require('../handlers/storemanager');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		logger.info(`Logged in as ${client.user.tag}. Bot Online!`);
    logger.warn('Still running final checks! Bot may be slow for a few minutes.')
    clearTimeout(client.timers.rateLimitWarn);
    logger.debug('Cleared ratelimit warning timer.');
    // Fetch application information.
    client.application = await client.application.fetch();
    // Check settings database.
    await client.settings.init();
    let guilds = client.guilds.cache.map(g => g.id);
    await client.settings.guild.init(guilds);
    logger.info('Finished final checks. Preparing commands.');
    // Load commands here using the client's unique ID.
    //loadPrefixCmds(client); // load prefixed commands. (DEPRECIATED!)
    loadSlashCmds(client); // load slash commands.
    // Prepare configuration for the dashboard service.
    const dashConfig = {
      "debug": debug, // used to enable debug console log data.
      "dashPort": dashSrvPort,
      "reportOnly": reportOnly,
      "clientID" : client.application.id,
      "oauthSecret" : clientSecret,
      "sessionSecret" : sessionSecret || 'ZeonX64',
      "botDomain" : (dashDomain) ? dashDomain : `https://localhost:${dashSrvPort}`,
      "callbackURL" : (dashDomain) ? `${dashDomain}/api/discord/callback` : `https://localhost:${dashSrvPort}/api/discord/callback`
    };
    logger.debug('Loading dashboard configuration.');
    if (debug) {
      logger.debug(`Dashboard Configuration:\n${JSON.stringify(dashConfig, null, 2)}`);
    } else {
      logger.debug('Dashboard Config is hidden. Enable debug mode to reveal this.');
    };    
    logger.debug('Preparing to initialize dashboard...');
    // Start dashsrv to handle heartbeat ping requests. (eg. UptimeRobot)
    try {
      logger.verbose(`enableDash=${enableDash}`);
      if (enableDash) {
        logger.init('Initialising dashboard service.');
        require('../dashboard/dashsrv.js')(client, dashConfig);
      } else {
        logger.debug('Dashboard is disabled. Falling back to basic service pinger.');
        require('../dashboard/basicsrv.js');
      }
    } catch (err) {
      // fallback to basicsrv silently if fails.
      logger.error('Dashboard service failed to start!');
      logger.warn('Dashboard cannot be loaded. Report this to the developers!');
      logger.debug(err.stack);
      require('../dashboard/basicsrv.js');
    };
	},
};