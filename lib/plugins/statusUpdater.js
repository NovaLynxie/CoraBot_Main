const logger = require('../utils/winstonLogger.js');
const { activities } = require('../assets/resources/activitiesList.json');
module.exports = (client) => {
  function updateStatus() {
    let statusType;
    const index = Math.floor(Math.random() * (activities.length - 1) + 1);
    if (index >= 0 && index <= 1) {
      statusType = 'PLAYING';
    } else if (index >= 2 && index <= 3) {
      statusType = 'LISTENING';
    } else if (index >= 4 && index <= 5) {
      statusType = 'WATCHING';
    };
    client.user.setActivity(activities[index], { type: statusType });
  };  
  const statusTimer = setInterval(updateStatus, 300 * 1000);
  client.timers.statusUpdate = statusTimer;
  setTimeout(updateStatus, 5000);
};