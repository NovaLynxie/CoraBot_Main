// Native Node Imports
const url = require('url'), path = require('path'), fs = require('fs');
// Extra Formatting
const { stripIndents } = require('common-tags');
const { formatDistance } = require('date-fns');
// Fetch Bot version
const { version } = require('../../package.json');
// Winston Logger Plugin
const logger = require('../plugins/winstonLogger');
// For Discord Permission Handling
const Discord = require('discord.js');
// Express Session
const express = require('express');
const app = express();
// Express Plugins
const morgan = require('morgan');
const passport = require('passport');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const DiscordStrategy = require('passport-discord-faxes').Strategy;
// Express Routers
const authRouter = require('./routes/auth');
const dashRouter = require('./routes/dash');
const publicRouter = require('./routes/public');

logger.dash('Starting Dashboard Service...');

module.exports = async (client, config) => {
	(function() {
		logger.debug('Checking dashboard configuration...');
		if (!config) throw new Error('Dashboard configuration missing!');
		if (typeof config !== 'object') throw new Error(`Invalid configuration! Expected object, got '${typeof config}'.`);
		if (!config.clientID) throw new Error('Client ID missing or undefined!');
		if (!config.oauthSecret) throw new Error('OAuth Secret missing or undefined!');
		if (!config.callbackURL) throw new Error('Callback/Redirect URL missing or undefined!');
		if (!config.sessionSecret) logger.warn('Session Secret not set! May cause problems.');
		logger.debug('Dashboard configuration OK. Continuing with startup.');
	})();
	// Initialise morgan logger for server side logging. (debug only)
  if (config.debug){
    app.use(morgan('tiny', {
      stream: { write: message => logger.dash(`dash => ${message}`) },
    }));
  };
	const dashDir = path.resolve(`${process.cwd()}/core/dashboard`);
	const viewsDir = path.resolve(`${dashDir}/views/`);
	const publicDir = path.resolve(`${dashDir}/public/`);
	app.use('/public', express.static(publicDir));
	passport.serializeUser((user, done) => {
		done(null, user);
	});
	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});
  passport.use(new DiscordStrategy({
		clientID: config.clientID,
		clientSecret: config.oauthSecret,
		callbackURL: config.callbackURL,
		scope: ['identify', 'guilds'],
		prompt: 'consent',
	},
	(accessToken, refreshToken, profile, done) => {
		process.nextTick(() => done(null, profile));
	}));
  app.use(session({
		store: new SQLiteStore({
			db: 'sessions.db',
			dir: './data/',
		}),
		secret: process.env.SESSION_SECRET || config.sessionSecret,
		// cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, //disabled temporarily
		resave: false,
		saveUninitialized: false,
		unset: 'destroy',
	}));
	app.use(passport.initialize());
	app.use(passport.session());
  app.use(helmet({
		contentSecurityPolicy: {
			useDefaults: true,
			directives: {
				// supported by most browsers
				defaultSrc: [`'self'`, 'https:'],
				scriptSrc: [
					`'self'`, 'https:', `'unsafe-inline'`, '*.jquery.com', '*.cloudflare.com', '*.bootstrapcdn.com', '*.datatables.net', '*.jsdelivr.net', '*.googleapis.com', `'nonce-themeLoader'`, `'nonce-memberModals'`,
				],
				fontSrc: [
					`'self'`, 'https:', 'fonts.googleapis.com',
					'*.gstatic.com', 'maxcdn.bootstrapcdn.com',
				],
				styleSrc: [
					`'self'`, 'https:', `'unsafe-inline'`, '*.bootstrapcdn.com', '*.googleapis.com',
				],
				imgSrc: [
					`'self'`, 'https:', 'http:', 'data:', 'w3.org', 'via.placeholder.com', 'cdn.discordapp.com', 'i.giphy.com', 'media.tenor.com',
				],
				objectSrc: [`'none'`],
				// supported by some browsers (firefox doesn't at this time)
				scriptSrcElem: [
					`'self'`, 'https:', `'unsafe-inline'`, `'nonce-themeLoader'`, `'nonce-memberModals'`, '*.jquery.com', '*.cloudflare.com', '*.bootstrapcdn.com', '*.datatables.net', '*.jsdelivr.net',
				],
				scriptSrcAttr: [
					`'self'`, 'https:',
				],
				styleSrcElem: [
					`'self'`, 'https:', '*.bootstrapcdn.com', '*.googleapis.com',
				],
				upgradeInsecureRequests: [],
			},
			reportOnly: config.reportOnly || false,
		},
	}));
  app.set('view engine', 'pug');
	app.use(express.json());
	app.use(express.urlencoded({
		extended: true,
	}));
  app.use(require('flash')());
	function checkAuth(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		}	else {
			logger.debug(`req.url='${req.url}'`);
			req.session.backURL = req.url; res.status(401);
      req.flash('info', 'Login expired. You have been signed out.');
			logger.debug(`req.session.backURL='${req.session.backURL}'`);
			res.redirect('/login');
		};
	};
	function isManaged(guild, dashuser) {
		const member = guild.members.cache.get(dashuser.id);
		const res = member.permissions.has('MANAGE_GUILD');
		return res;
	};
	function get_breadcrumbs(url) {
		let rtn = [{ name: 'HOME', url: '/' }], acc = '', arr = url.substring(1).split('/');
		for (i = 0; i < arr.length; i++) {
			acc = i != arr.length - 1 ? acc + '/' + arr[i] : null;
			rtn[i + 1] = { name: arr[i].toUpperCase(), url: acc };
		}; return rtn;
	};
	const renderView = (res, req, template, data = {}) => {
		logger.debug(`Preparing template ${template}`);
		const baseData = {
			bot: client,
			config: config,
			path: req.path,
			user: req.isAuthenticated() ? req.user : null,
			isAdmin: req.session.isAdmin,
			breadcrumbs: req.breadcrumbs,
		};
		if (config.debug) {
			logger.debug('Dumping data from render parameters');
			logger.data(`baseData=${JSON.stringify(baseData)}`);
			logger.data(`data=${JSON.stringify(data)}`);
		}
		logger.debug(`Rendering template ${template} with 'baseData' and 'data' parameters.`);
		res.render(path.resolve(`${viewsDir}${path.sep}${template}`), Object.assign(baseData, data));
	};
	app.use(function(req, res, next) {
		req.breadcrumbs = get_breadcrumbs(req.originalUrl);
		next();
	});
	app.get('/ping', (req, res, next) => {
		res.send('DiscordBot/Dashboard Heartbeat Endpoint. Nothing to see here. :)');
	});
	// Router Middleware - All Dashboard Actions and Routes.
  app.use('/', publicRouter);
  app.use('/auth', authRouter);
  app.use('/dashboard', dashRouter);
	// Fallback Middleware.
	// 404 Not Found Handler (Only occurs if no error was thrown)
	app.use(function(req, res, next) {
		res.status(404);
		renderView(res, req, 'errors/404.pug');
	});
	// Error Handling
	app.use(function(err, req, res, next) {
		logger.debug('Error occured in dashboard service!');
		logger.verbose(err);
		function missingError(err) {
			if (err.stack) logger.debug(err.stack);
			return res.status(404), renderView(res, req, 'errors/404.pug');
		}
		function serverError(err) {
			if (err.stack) logger.debug(err.stack);
			const errData = {
				message: (err.message) ? err.message : 'N/A',
				code: (err.code) ? err.code : 'N/A',
				stack: (err.stack) ? err.stack.split('at') : 'No stacktrace provided.',
			};
			return res.status(500), renderView(res, req, 'errors/500.pug', errData);
		}
		function defaultError() {
			logger.debug('An unknown error occured!');
			logger.debug(err);
			return res.status(500), renderView(res, req, 'errors/500.pug');
		}
		if (err.code) {
			if (err.code === 'invalid_client') {
				serverError(err);
				logger.error('Invalid Client! Aborting user login.');
				logger.warn('Mismatched client information. Please check settings.');
			}
			if (err.code === 'ERR_HTTP_HEADERS_SENT') {
				logger.warn('Server tried to send more than one header to client!');
				logger.debug('Too many headers sent or called by dashboard service!');
				logger.debug(err.stack);
			}
		} else
		if (err.message) {
			if (err.message.indexOf('is not a') > -1) {
				serverError(err);
				logger.debug('Errored while rendering template!');
			}
			if (err.message.indexOf('Cannot read property') > -1) {
				serverError(err);
				logger.debug('Errored while rendering template!');
			}
			if (err.message.indexOf('Failed to lookup view') > -1) {
				missingError(err);
				logger.debug('Error! Missing asset file!');
				logger.debug(err.stack);
			}
		} return defaultError();
	});
	app.listen(config.dashPort, () => {
		logger.dash(`Dashboard service running on port ${config.dashPort}`);
	});
};