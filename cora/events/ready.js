const {assets, dashcfg} = require('../handlers/bootLoader');
const {activities} = assets;
const {enableDashboard, port, clientID, callbackURL, botDomain} = dashcfg;
const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // Fetch application information here.
    client.application = await client.fetchApplication();
    logger.data(client.application.description.length)
    logger.data(client.application.description)
    // Configuring dashboard settings here.
    const dashconfig = {
      "dashboard" : {
        "clientID" : client.application.id,
        "oauthSecret" : process.env.clientSecret,
        "sessionSecret" : process.env.sessionSecret,
        "botDomain" : process.env.botDomain || botDomain,
        "callbackURL" : process.env.callbackURL || callbackURL      
      }
    };
    // Announce when client is connected and ready.
    logger.info(`Logged in as ${client.user.tag}!`);
    logger.data(`Bot User ID: ${client.user.id} (typeof:${typeof(client.user.id)})`);
    logger.data(`Client owner(s): ${client.owners} (typeof:${typeof(client.owners)})`);
    client.owners.forEach(user => {
      logger.debug('Listing client.owners as username#discriminator id')
      logger.data(`${user.username}#${user.discriminator} ID:${user.id}`)
    })
    client.user.setActivity('with Commando');
    // Spin up built-in server once client is online and ready.
    try {
      if (enableDashboard || enableDashboard === 'yes') {
        require('../dashboard/dashsrv')(client, dashconfig);
      } else {
        require('../internal/websrv'); 
      }
    } catch (err) {
      // In the event the dashboard fails, fallback to websrv.js here.
      logger.error(err); logger.debug(err.stack);
      logger.warn('Unable to start dashsrv service due to error!')
      logger.warn('Falling back to web server responder.')
      require('../internal/websrv'); 
    }
    // Setup interval timers to update status and database.
    setInterval(async () => {    
      // status updater
      logger.verbose("ran task update_status")
      const index = Math.floor(Math.random() * (activities.length - 1) + 1);
      if (index >= 0 && index <= 1) {
        var statusType = 1 // 1 - Playing
      };
      if (index >= 2 && index <= 3) {
        var statusType = 2 // 2 - Listening
      };
      if (index >= 4 && index <= 5) {
        var statusType = 3 // 3 - Watching
      };
      client.user.setActivity(activities[index], {type: statusType});
      logger.verbose(`Updated status to activity ${index} of ${activities.length-1}`)
    }, 300000);
  },
};