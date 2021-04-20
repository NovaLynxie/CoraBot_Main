require('dotenv').config() // load .env as early as possible
const winston = require('winston');
require('winston-daily-rotate-file'); //re-added for daily logs.
const {name} = require('../../package.json');
const {addColors, createLogger, format, transports} = winston
const {combine, colorize, errors, json, timestamp, printf} = format;
var {logLevel} = process.env; // gets logLevel from os process.env vars
if (!logLevel||logLevel==undefined) {
  // if not defined then set as 'error' by default.
  logLevel = 'error';
}

// Logging Levels
const customLevels = {
  levels: {
    init: 0, 
    info: 1,
    warn: 2,
    error: 3,
    data: 4,
    debug: 5,
    verbose: 6,
  },
  colors: {
    init: 'dim white',
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
      timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
      printf(info => `(${info.timestamp}) [${info.level}] ${info.message}`),
      errors({stack: true}),
  ),
  transports: [
    // Console transport created here.
    new transports.Console({
      level: logLevel,
      format: combine(
        colorize(),
        errors({stack: true,}),
        timestamp({format: 'HH:mm:ss'}),
        printf(info => `(${info.timestamp}) [${info.level}] ${info.message}`),
      ),
      handleExceptions: true
    }),
    new transports.DailyRotateFile({      
      level: 'error',
      format: combine(
        errors({stack: true}),
        timestamp({format: 'HH:mm:ss'}),
      ),  
      filename: `./logs/${name}-%DATE%.log`,
      datePattern: 'DD-MM-YY',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '7d'
    }),
    new transports.DailyRotateFile({
      level: 'debug',
      format: combine(
        errors({stack: true}),
        timestamp({format: 'HH:mm:ss'}),
      ),
      filename: `./logs/debug-%DATE%.log`,
      datePattern: 'DD-MM-YY',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '7d'
    })
  ],
});

module.exports = logger;