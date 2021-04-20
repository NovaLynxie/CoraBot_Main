const winston = require('winston');
const {addColors, createLogger, format, transports} = winston
const {combine, colorize, errors, json, timestamp, printf} = format;
const {debug} = require('../../config.json');
// Logging Levels
var conLvl;
if (debug == 'true') {
  conLvl = 'verbose';
} else {
  conLvl = 'error';
}
const customLevels = {
  levels: {
    silly: 0, 
    info: 1,
    data: 2,
    warn: 3,
    error: 4,
    debug: 5,
    verbose: 6,
  },
  colors: {
    silly: 'grey',
    info: 'green',
    data: 'cyan',
    warn: 'yellow',
    error: 'red',
    debug: 'blue',
    verbose: 'magenta'
  }
};

addColors(customLevels.colors);

const logger = createLogger({
  levels: customLevels.levels,
    format: combine(
      timestamp({format: 'DD-MM-YYYY HH:mm:ss ZZ'}),
      printf(info => `(${info.timestamp}) [${info.level}] ${info.message}`),
      errors({stack: true}),
  ),
  transports: [
    // Console transport created here.
    new transports.Console({
      level: conLvl,
      format: combine(
        colorize(),
        errors({stack: true,}),
        timestamp({format: 'HH:mm:ss'}),
        printf(info => `(${info.timestamp}) [${info.level}] ${info.message}`),
      ),
      handleExceptions: true
    }),
  ],
});
module.exports = logger;