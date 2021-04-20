const fs = require('fs');
const logger = require('../providers/WinstonPlugin');
// Sets time and date of the crash report file as logstamp.
function timeStamp (date) { 
  var hrs, mins, secs, logtime, day, month, year, logdate;
  // Get current time as hours.mins.secs and put into logtime
  hrs = date.getUTCHours();
  if (hrs <= 9) hrs = `0${hrs}`
  mins = date.getUTCMinutes();
  if (mins <= 9) mins = `0${mins}`
  secs = date.getUTCSeconds();
  if (secs <= 9) secs = `0${secs}`
  logtime = `${hrs}.${mins}.${secs}`
  // Get current date as day-month-year and put into logdate
  day = date.getUTCDate();
  month = date.getUTCMonth() + 1; // Adds one to get actual month.
  year = date.getUTCFullYear();
  logdate = `${day}-${month}-${year}`
  // Now combine both logtime and logdate to get full logstamp.
  return logstamp = `${logdate}_${logtime}`;
}
module.exports = function crashReporter (error) {
  let stack = error.stack;
  let messages = ["Did I do that?","Erm... whoops.","Hehe, my bad...", "Well, feck if I how that happened. ¯\\_(ツ)_/¯","CoraBot.exe stopped unexpectedly (X_X)"]
  let randomMsg = Math.floor(Math.random() * messages.length);
  let date = new Date();
  let logstamp = timeStamp(date);
  let filepath = `./logs/crash-reports/crash-${logstamp}.txt`
  let crashdata = `Log Date: ${logstamp}
  Program crashed unexpectedly! Generating crash-report...
  ${randomMsg}
    Caused by: ${error}
    Stacktrace:
      ${stack}`

  fs.writeFile(filepath, crashdata, function(error) {
    if (error) {
      let stack = error.stack;
      logger.error(`Something went wrong while writing crash report!`)
      logger.error(`Caused by: ${error}`)
      logger.warn(`Error details may have been lost, check console.`)
    }
    logger.warn(`Log saved to ${filepath}`)
  })
}