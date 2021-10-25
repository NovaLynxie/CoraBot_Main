require('dotenv').config();
const winston = require('winston');
require('winston-daily-rotate-file');
const { name } = require('../../package.json');
const { addColors, createLogger, format, transports } = winston;
const { combine, colorize, errors, timestamp, printf } = format;
let { logLevel } = process.env;
if (!logLevel || logLevel == undefined) {
	logLevel = 'fatal';
};
const customLevels = {
	levels: {
		init: 0,
		info: 1,
		dash: 2,
		warn: 3,
		fatal: 4,
		error: 5,
		data: 6,
		debug: 7,
		verbose: 8,
	},
	colors: {
		init: 'dim white',
		info: 'green',
		data: 'dim blue',
		dash: 'cyan',
		warn: 'bold yellow',
		error: 'red',
		fatal: 'bold red',
		debug: 'blue',
		verbose: 'magenta',
	},
};
addColors(customLevels.colors);
const logger = createLogger({
	levels: customLevels.levels,
	format: combine(
		timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
		printf(info => `(${info.timestamp}) [${info.level}] ${info.message}`),
		errors({ stack: true }),
	),
	transports: [
		new transports.Console({
			level: logLevel,
			format: combine(
				colorize(),
				errors({ stack: true }),
				timestamp({ format: 'HH:mm:ss' }),
				printf(info => `(${info.timestamp}) [${info.level}] ${info.message}`),
			),
			handleExceptions: true,
		}),
		new transports.DailyRotateFile({
			level: 'fatal',
			format: combine(
				errors({ stack: true }),
				timestamp({ format: 'HH:mm:ss' }),
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
				errors({ stack: true }),
				timestamp({ format: 'HH:mm:ss' }),
			),
			filename: './logs/debug-%DATE%.log',
			datePattern: 'DD-MM-YY',
			zippedArchive: true,
			maxSize: '50m',
			maxFiles: '7d'
		})
	],
});
module.exports = logger;