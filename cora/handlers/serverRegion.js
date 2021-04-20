const moment = require('moment')
require('moment-timezone')

module.exports = function getTimezone(message) {
  var getServerRegion = message.guild.region;
  var getServerTime = message.createdTimestamp;
  let setServerRegion = '';
  // Supported Regions for the timezone provider.
  if (getServerRegion == 'us-central') setServerRegion = 'America/Denver'
  if (getServerRegion == 'us-west') setServerRegion = 'America/Los_Angeles'
  if (getServerRegion == 'us-east') setServerRegion = 'America/New_York'
  if (getServerRegion == 'us-south') setServerRegion = 'America/Mexico_City'
  if (getServerRegion == 'europe') setServerRegion = 'Europe/London';
  if (getServerRegion == 'brazil') setServerRegion = 'America/Araguaina';
  if (getServerRegion == 'hongkong') setServerRegion = 'Asia/Hong_Kong';
  // Combine all information gathered before returning to command.
  var LocalTime = moment.utc(getServerTime).tz(setServerRegion).format('dddd, MMMM Do YYYY, HH:mm:ss Z')
  return LocalTime
}