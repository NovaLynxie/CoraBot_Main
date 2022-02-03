const path = require('path'), fs = require('fs');
const { stripIndents } = require('common-tags');
const { formatDistance } = require('date-fns');
const { version } = require('../../package.json');
const logger = require('../utils/winstonLogger');

const express = require('express');
const app = express();
const morgan = require('morgan');
const passport = require('passport');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const DiscordStrategy = require('passport-discord-faxes').Strategy;

const authRouter = require('./routes/auth');
const dashRouter = require('./routes/dash');
const publicRouter = require('./routes/public');
const dashDir = path.resolve(`${process.cwd()}/lib/dashboard`);
const viewsDir = path.resolve(`${dashDir}/views/`);
const publicDir = path.resolve(`${dashDir}/public/`);
const { fetchBreadcrumbs, renderView } = require('./dashUtils');

module.exports = async (client, config) => {
  (() => {
    logger.debug('Checking dashboard configuration...');
    if (!config) throw new Error('Dashboard configuration missing!');
    if (typeof config !== 'object') throw new Error(`Invalid configuration! Expected object, got '${typeof config}'.`);
    if (!config.clientID) throw new Error('Client ID missing or undefined!');
    if (!config.oauthSecret) throw new Error('OAuth Secret missing or undefined!');
    if (!config.callbackURL) throw new Error('Callback/Redirect URL missing or undefined!');
    if (!config.sessionSecret) logger.warn('Session Secret not set! May cause problems.');
    logger.debug('Dashboard configuration OK. Continuing with startup.');
  })();
  if (config.debug) {
    app.use(morgan('tiny', {
      stream: { write: message => logger.dash(`dash => ${message}`) },
    }));
  };
  app.use('/public', express.static(publicDir));
  passport.serializeUser((user, done) => { done(null, user) });
  passport.deserializeUser((obj, done) => { done(null, obj) });
  passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.oauthSecret,
    callbackURL: config.callbackURL,
    scope: ['identify', 'guilds'],
    prompt: 'consent',
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));
  app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './data/' }),
    secret: process.env.SESSION_SECRET || config.sessionSecret,
    // cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, //disabled temporarily
    resave: false, saveUninitialized: false, unset: 'destroy'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
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
      }, reportOnly: config.reportOnly || false
    },
  }));
  app.set('view engine', 'pug');
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true,
  }));
  app.use(require('flash')());
  app.use(function (req, res, next) {
    req.breadcrumbs = fetchBreadcrumbs(req.originalUrl);    
    res.locals.client = client; res.locals.config = config; next();
  });
  app.get('/ping', (req, res, next) => {
    res.send('DiscordBot/Dashboard Heartbeat Endpoint. Nothing to see here. :)');
  });
  app.use('/', publicRouter);
  app.use('/', authRouter);
  app.use('/dashboard', dashRouter);

  app.use(function (req, res, next) {
    res.status(404);
    renderView(res, req, 'errors/404.pug');
  });
  
  app.use(function (err, req, res, next) {
    logger.debug('Error occured in dashboard service!');
    logger.verbose(err);
    function missingError(err) {
      if (err.stack) logger.debug(err.stack);
      return res.status(404), renderView(res, req, 'errors/404.pug');
    };
    function serverError(err) {
      if (err.stack) logger.debug(err.stack);
      const errData = {
        message: (err.message) ? err.message : 'N/A',
        code: (err.code) ? err.code : 'N/A',
        stack: (err.stack) ? err.stack.split('at') : 'No stacktrace provided.',
      };
      return res.status(500), renderView(res, req, 'errors/500.pug', errData);
    };
    function defaultError() {
      logger.debug('An unknown error occured!');
      logger.debug(err.stack);
      return res.status(500), renderView(res, req, 'errors/500.pug');
    };
    if (err.code) {
      if (err.code === 'invalid_client') {
        serverError(err);
        logger.error('Invalid Client! Aborting user login.');
        logger.warn('Mismatched client information. Please check settings.');
      };
      if (err.code === 'ERR_HTTP_HEADERS_SENT') {
        logger.warn('Server tried to send more than one header to client!');
        logger.debug('Too many headers sent or called by dashboard service!');
        logger.debug(err.stack);
      };
    } else
      if (err.message) {
        if (err.message.indexOf('is not a') > -1) {
          serverError(err);
          logger.debug('Errored while rendering template!');
        };
        if (err.message.indexOf('Cannot read property') > -1) {
          serverError(err);
          logger.debug('Errored while rendering template!');
        };
        if (err.message.indexOf('Failed to lookup view') > -1) {
          missingError(err);
          logger.debug('Error! Missing asset file!');
          logger.debug(err.stack);
        };
      }; return defaultError();
  });
  
  app.listen(config.dashPort, () => {
    logger.dash(`Dashboard service running on port ${config.dashPort}`);
  });
};