const logger = require('./winstonLogger');
const { activities } = require('../assets/resources/activitiesList.json');

module.exports = (client) => {
  // Setup interval timers to update status and database.
  let statusTimer = setInterval(async () => {    
    // status updater
    logger.verbose("ran task update_status")
    const index = Math.floor(Math.random() * (activities.length - 1) + 1);
    if (index >= 0 && index <= 1) {
      var statusType = 'PLAYING'
    } else 
    if (index >= 2 && index <= 3) {
      var statusType = 'LISTENING'
    } else 
    if (index >= 4 && index <= 5) {
      var statusType = 'WATCHING'
    };
    client.user.setActivity(activities[index], {type: statusType});
    logger.verbose(`Updated status to activity ${index} of ${activities.length-1}`)
  }, 300000);
  client.timers.statusUpdate = statusTimer;
};
