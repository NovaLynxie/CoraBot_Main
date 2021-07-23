require('dotenv').config() // load .env as early as possible
const winston = require('winston');
require('winston-daily-rotate-file'); //re-added for daily logs.
const {name} = require('../../package.json');
const {addColors, createLogger, format, transports} = winston;
const {combine, colorize, errors, timestamp, printf} = format;
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
    dash: 2,
    warn: 3,
    error: 4,
    severe: 5,
    data: 6,
    debug: 7,
    verbose: 8,
  },
  colors: {
    init: 'dim white',
    info: 'green',    
    data: 'cyan',
    dash: 'cyan',
    warn: 'bold yellow',
    error: 'bold red',
    severe: 'bold dim red',
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