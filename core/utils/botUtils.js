const fs = require('fs'), logger = require('../utils/winstonLogger');
const dataDirPath = './data', dbFiles = ['guilds', 'sessions', 'settings'];

function calcAccAge(date) {
  const sysDate = new Date();
  const accDate = new Date(date);
  const diff = sysDate - accDate;
  const seconds = Math.floor(diff / 1000),
    minutes = Math.floor(seconds / 60),
    hours   = Math.floor(minutes / 60),
    days    = Math.floor(hours / 24),
    months  = Math.floor(days / 30),
    years   = Math.floor(days / 365);
  const lt1 = (num) => num > 1;  
  const res = (lt1(years)) ? `${years} years` : '' || (lt1(months)) ? `${months} months` : '' || (lt1(days)) ? `${days} days` : '' || (lt1(hours)) ? `${hours} hrs` : '' || (lt1(minutes)) ? `${minutes} mins` : 'less than a minute';
  return res;
};
function calcDuration(msecs) {
  let seconds, minutes, hours, days, weeks, months, years, duration;
  seconds = Math.floor(msecs / 1000);
  minutes = Math.floor(seconds / 60);
  hours = Math.floor(minutes / 60);
  days = Math.floor(hours / 24);
  weeks = Math.floor(days / 7);
  months = Math.floor(days / 30.417);
  years = Math.floor(months / 12);
  duration = { seconds, minutes, hours, days, weeks, months };
  return duration;
};

async function startBackup() {
  logger.debug('Started database backup.');
  for (const dbName of dbFiles) {
    let a = `${dataDirPath}/${dbName}.db`;
    let b = `${dataDirPath}/${dbName}_backup.db`;
    await fs.copyFile(a, b, (err) => {
      if (err) return logger.fatal(err);
      logger.debug(`${dbName}_backup created successfully!`);
    });
  };  
  logger.debug('Completed database backup.');
};
async function restoreBackup(dbName) {
  if (!dbFiles.includes(dbName)) return logger.verbose('Unknown DB filename!');
  logger.debug('Restoring database from backup.');
  let a = `${dataDirPath}/${dbName}.db`;
  let b = `${dataDirPath}/${dbName}_backup.db`;
  await fs.copyFile(a, b, (err) => {
    if (err) return logger.fatal(err);
    logger.debug('Restored database backup successfully!.');  
  });
};

module.exports.utils = { 
  accAge: calcAccAge, duration: calcDuration, 
  db: { backup: startBackup, restore: restoreBackup }
};