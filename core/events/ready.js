const logger = require('../plugins/winstonplugin');
const {config} = require('../handlers/bootloader');
const {debug, dashboard} = config;
const {enableDash, dashSrvPort, reportOnly} = dashboard;
const {storeHandler} = require('../handlers/storehandler');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		logger.info(`Logged in as ${client.user.tag}. Bot Online!`);
    client.application = await client.application.fetch();
    // Prepare configuration for the dashboard service.
    const dashConfig = {
      "debug": debug, // used to enable debug console log data.
      "dashPort": dashSrvPort,
      "reportOnly": reportOnly,
      "clientID" : client.application.id,
      "oauthSecret" : process.env.clientSecret,
      "sessionSecret" : process.env.sessionSecret || 'ZeonX64',
      "botDomain" : process.env.botDomain || `https://localhost:${dashSrvPort}`,
      "callbackURL" : process.env.callbackURL || `https://localhost:${dashSrvPort}/auth/discord/callback`
    };
    // Start dashsrv to handle heartbeat ping requests. (eg. UptimeRobot)
    try {
      logger.verbose(`enableDash=${enableDash}`);
      if (enableDash) {
        logger.debug('Initialising dashboard service.');
        require('../dashboard/dashsrv.js')(client, dashConfig);
      }
    } catch (err) {
      // fallback to basicsrv silently if fails.
      logger.error('Dashboard service failed to start!');
      logger.warn('Dashboard cannot be loaded. Report this to the developers!');
      logger.debug(err.stack);
      require('../dashboard/basicsrv.js');
    };
    let guilds = client.guilds.cache.map(g => g.id);
    let data = {
      guilds: guilds,
      mode: 'g'
    };    
    await storeHandler(data, client);
	},
};