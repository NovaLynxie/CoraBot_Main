// Native Node Imports
const url = require("url");
const path = require("path");

// Winston Logger Plugin
const logger = require('../providers/WinstonPlugin');

// For Discord Permission Handling
const Discord = require("discord.js");

// Express Session
const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");
// Express Plugins
const passport = require("passport"); // oauth2 helper plugin
const helmet = require('helmet'); // security plugin
const session = require("express-session"); // express session manager
const SQLiteStore = require("connect-sqlite3")(session);
const Strategy = require("passport-discord").Strategy;

// Bot configuration (config.toml)
const {dashcfg} = require('../handlers/bootLoader');
const {port} = dashcfg;

logger.init('Starting Dashboard Service...');

module.exports = (client, config) => {
  // Dashboard root directory from bot working directory.
  const dashDir = path.resolve(`${process.cwd()}/cora/dashboard`);
  // Public and Views resource paths within Dashboard directory.
  const viewsDir = path.resolve(`${dashDir}/views/`)
  const publicDir = path.resolve(`${dashDir}/public/`)
  app.use("/public", express.static(publicDir));
  // Passport user handlers. Internal things for passport module.
  // Do not touch these, just leave them be.
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  // Defines Passport oauth2 data needed for dashboard authorization.
  // Requires clientID, clientSecret and callbackURL.
  // - clientID is the bot's unique client identification string.
  // - clientSecret is a secret code for oauth2 handling.
  // - callbackURL is the url to handle discord api callbacks.
  passport.use(new Strategy({
    clientID: config.dashboard.clientID,
    clientSecret: config.dashboard.oauthSecret,
    callbackURL: config.dashboard.callbackURL,
    scope: ["identify", "guilds"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));
  // Session Data
  // This is used for temporary storage of your visitor's session information. It contains secrets that should not be shared publicly.
  app.use(session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./cora/cache/"
    }),
    secret: process.env.SESSION_SECRET || config.dashboard.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }));

  // Initializes passport and session.
  app.use(passport.initialize());
  app.use(passport.session());
  // Initializes helmet with these options for all site pages.
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'", "https:"],
        scriptSrc: [
          "'self'", "https:", "*.bootstrapcdn.com", "*.googleapis.com"
          ],
        fontSrc: [
          "'self'", "https:", "fonts.googleapis.com",
          "*.gstatic.com", "maxcdn.bootstrapcdn.com"
        ],
        styleSrc: [
          "'self'", "'unsafe-inline'", "*.bootstrapcdn.com", "*.googleapis.com"
        ],
        imgSrc: [
          "'self'", "cdn.discordapp.com", "i.giphy.com", "media.tenor.com"
        ],        
        styleSrcElem: [
          "'self'", "https:", "*.bootstrapcdn.com", "*.googleapis.com"
        ],
        scriptSrcElem: [
          "'self'", "https:", "*.jquery.com", "*.cloudflare.com", "*.bootstrapcdn.com", "*.datatables.net", "*.jsdelivr.net"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
      reportOnly: false
    }
  }));

  // The PUG templating engine allows for simpler setups and easy to read formatting in pages.
  // It allows us separate header and footer components.
  app.set("view engine", "pug");

  // body-parser reads incoming JSON or FORM data and simplifies their
  // use in code.
  var bodyParser = require("body-parser");
  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 

  /* 
  Authentication Checks. For each page where the user should be logged in, double-checks whether the login is valid and the session is still active.
  */
  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }

  // This function simplifies the rendering of the page, since every page must be rendered
  // with the passing of these 4 variables, and from a base path. 
  // Objectassign(object, newobject) simply merges 2 objects together, in case you didn't know!
  const renderView = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      config: config,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${viewsDir}${path.sep}${template}`), Object.assign(baseData, data));
  };

  // Dashboard Actions - All Interaction & Authentication actions.

  // Login Endpoint 
  // Sends user to authenticate via discord oauth2.
  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      next();
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate("discord"));

  // OAuth2 Callback Endpoint 
  // Once user returns, this is called to complete authorization.
  app.get("/api/discord/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), (req, res) => {
    (client.owner === req.user.id) ? req.session.isAdmin = true : req.session.isAdmin = false
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  });
  
  // If an error happens during authentication, this is what's displayed.
  app.get("/autherror", (req, res) => {
    renderView(res, req, "autherr.pug");
  });

  // Logout Endpoint - Destroys the session to log out the user.
  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/"); //Inside a callback… bulletproof!
    });
  });
  
  // Dashboard Routes - Public and Authenticated site endpoints.

  // Regular Information Pages (public pages)
  app.get("/", (req, res) => {
    renderView(res, req, "index.pug");
  });
  app.get("/commands", (req, res) => {
    var groups = client.registry.groups;
    var allcmds = `${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden)).map(grp => `
      ${grp.name} ${grp.commands.filter(cmd => !cmd.hidden).map(cmd => `
        ${cmd.name}: ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('')
      }`).join('\r\n')
    }`
    logger.data(`allcmds:${typeof(allcmds)}`);
    renderView(res, req, "cmds.pug", {
      all_commands: allcmds
    });
  });
  app.get("/stats", (req, res) => {
    const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    const members = client.guilds.cache.reduce((p, c) => p + c.memberCount, 0);
    const textChannels = client.channels.cache.filter(c => c.type === "text").size;
    const voiceChannels = client.channels.cache.filter(c => c.type === "voice").size;
    const guilds = client.guilds.cache.size;
    renderView(res, req, "stats.pug", {
      stats: {
        servers: guilds,
        members: members,
        text: textChannels,
        voice: voiceChannels,
        uptime: duration,
        memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        discordVer: Discord.version,
        nodeVer: process.version
      }
    })
  });
  
  // Authentication Locked Pages (Discord Oauth2)

  app.get("/dashboard", checkAuth, (req, res) => {
    //const perms = Discord.EvaluatedPermissions; //depreciated in discord.js v12
    const perms = Discord.Permissions;
    renderView(res, req, "dash.pug", {perms});
  });
  
  // Fallback Middleware.

  // 404 Not Found Handler (Only occurs if no error was thrown)
  app.use(function(req, res, next) {
    res.status(404);
    renderView(res, req, 'errors/404.pug');
  });

  // Error Handling
  app.use(function(err, req, res, next) {
    if (err.message.indexOf('Failed to lookup view') !== -1) {
      return res.status(404), renderView(res, req, 'errors/404.pug');
    }
    res.status(500);
    renderView(res, req, 'errors/500.pug');
    logger.error(err);
  });

  app.listen(port,() => {
    logger.info(`Server connected to port ${port}`);
  });
};