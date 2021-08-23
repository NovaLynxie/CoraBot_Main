const logger = require('../plugins/winstonlogger');
const {config, credentials} = require('../handlers/bootloader');
const {debug, dashboard} = config;
const {clientSecret, sessionSecret} = credentials;
const {enableDash, dashDomain, dashSrvPort, reportOnly} = dashboard;
const {storeHandler} = require('../handlers/storemanager');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		logger.info(`Logged in as ${client.user.tag}. Bot Online!`);
    clearTimeout(client.timers.rateLimitWarn);
    logger.debug('Cleared ratelimit warning timer.');
    client.application = await client.application.fetch();
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
    logger.debug(JSON.stringify(dashConfig));
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
    client.settings.init();
    let guilds = client.guilds.cache.map(g => g.id);
    client.settings.guild.init(guilds);
    /*
    let data = {
      guilds: guilds,
      mode: 'g'
    };
    await storeHandler(data, client);
    */
	},
};