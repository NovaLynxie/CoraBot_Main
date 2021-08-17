// Native Node Imports
const url = require("url"), path = require("path"), fs = require('fs');

// Fetch Bot version
const { version } = require('../../package.json');

// Winston Logger Plugin
const logger = require('../plugins/winstonplugin');

// For Discord Permission Handling
const Discord = require("discord.js");

// Express Session
const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");
// Express Plugins
const morgan = require('morgan'); // server-side logger
const passport = require("passport"); // oauth2 helper plugin
const helmet = require('helmet'); // security plugin
const session = require("express-session"); // express session manager
const SQLiteStore = require("connect-sqlite3")(session);
const Strategy = require("passport-discord").Strategy;

logger.dash('Starting Dashboard Service...');

module.exports = (client, config) => {
  // Initialise morgan logger for server side logging. (debug only)
  if (config.debug) {
    app.use(morgan("tiny", {
      stream: {
        write: message => logger.debug(`dash => ${message}`)
      }
    }));
  };
  // Dashboard root directory from bot working directory.
  const dashDir = path.resolve(`${process.cwd()}/core/dashboard`);
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
    clientID: config.clientID,
    clientSecret: config.oauthSecret,
    callbackURL: config.callbackURL,
    scope: ["identify", "guilds"]
  },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }));
  // Session Data
  // This is used for temporary storage of your visitor's session information. It contains secrets that should not be shared publicly.
  app.use(session({
    // session storage location
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./data/storage/"
    }),
    // session secret - verification step
    secret: process.env.SESSION_SECRET || config.sessionSecret,
    // session cookie - remove after one week elapses
    //cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, //disabled temporarily
    // session options
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
  }));

  // Initializes passport and session.
  app.use(passport.initialize());
  app.use(passport.session());
  // Initializes helmet with these options for all site pages.
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // supported by most browsers
        defaultSrc: ["'self'", "https:"],
        scriptSrc: [
          "'self'", "https:", "'unsafe-inline'", "*.jquery.com", "*.cloudflare.com", "*.bootstrapcdn.com", "*.datatables.net", "*.jsdelivr.net", "*.googleapis.com", "'nonce-themeLoader'", "'nonce-memberModals'"
        ],
        fontSrc: [
          "'self'", "https:", "fonts.googleapis.com",
          "*.gstatic.com", "maxcdn.bootstrapcdn.com"
        ],
        styleSrc: [
          "'self'", "https:", "'unsafe-inline'", "*.bootstrapcdn.com", "*.googleapis.com"
        ],
        imgSrc: [
          "'self'", "https:", "http:", "data:", "w3.org", "via.placeholder.com", "cdn.discordapp.com", "i.giphy.com", "media.tenor.com"
        ],        
        objectSrc: ["'none'"],
        // supported by some browsers (firefox doesn't at this time)
        scriptSrcElem: [
          "'self'", "https:", "'unsafe-inline'", "'nonce-themeLoader'", "'nonce-memberModals'", "*.jquery.com", "*.cloudflare.com", "*.bootstrapcdn.com", "*.datatables.net", "*.jsdelivr.net"
        ],
        scriptSrcAttr: [
          "'self'", "https:"
        ],
        styleSrcElem: [
          "'self'", "https:", "*.bootstrapcdn.com", "*.googleapis.com"
        ],
        upgradeInsecureRequests: [],
      },
      // used for debugging purposes to determine if csp is working.
      reportOnly: config.reportOnly || false       
    }
  }));

  // The PUG templating engine allows for simpler setups and easy to read formatting in pages.
  // It allows us separate header and footer components.
  app.set("view engine", "pug");

  // The EJS templating engine gives us more power to create complex web pages. 
  // This lets us have a separate header, footer, and "blocks" we can use in our pages.
  //app.engine("html", require("ejs").renderFile);
  //app.set("view engine", "html");

  // body-parser reads incoming JSON or FORM data and simplifies their
  // use in code.
  app.use(express.json());       // to support JSON-encoded bodies
  app.use(express.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

  // connect-flash used for express-messages status messages down further below.
  //app.use(require('connect-flash'));
  // flash used for displaying alert messages
  app.use(require('flash')());
  /* 
  Authentication Checks. For each page where the user should be logged in, double-checks whether the login is valid and the session is still active.
  */
  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      logger.debug(`req.url='${req.url}'`);
      req.session.backURL = req.url; res.status(401);
      logger.debug(`req.session.backURL='${req.session.backURL}'`)
      res.redirect("/login");
    };
  };
  /*
  Breadcrumb Fetcher. This uses the current page URL from ‘req’ to create breadcrumbs as an array of crumb objects, which is added to ‘req’. 
  Source: https://vidler.app/blog/javascript/nodejs/simple-and-dynamic-breadcrumbs-for-a-nodejs-express-application/
  */
  function get_breadcrumbs(url) {
    var rtn = [{ name: "HOME", url: "/" }],
      acc = "", // accumulative url
      arr = url.substring(1).split("/");

    for (i = 0; i < arr.length; i++) {
      acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
      rtn[i + 1] = { name: arr[i].toUpperCase(), url: acc };
    }
    return rtn;
  };
  // This function simplifies the rendering of the page, since every page must be rendered
  // with the passing of these 4 variables, and from a base path. 
  // Objectassign(object, newobject) simply merges 2 objects together, in case you didn't know!
  const renderView = (res, req, template, data = {}) => {
    logger.debug(`Preparing template ${template}`);
    const baseData = {
      bot: client,
      config: config,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
      isAdmin: req.session.isAdmin,
      breadcrumbs: req.breadcrumbs
    };
    if (config.debug) {
      logger.debug('Dumping data from render parameters');
      logger.data(`baseData=${JSON.stringify(baseData)}`);
      logger.data(`data=${JSON.stringify(data)}`);
    };
    logger.debug(`Rendering template ${template} with 'baseData' and 'data' parameters.`);
    res.render(path.resolve(`${viewsDir}${path.sep}${template}`), Object.assign(baseData, data));
  };
  // Express Messages Middleware
  /*
  app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  */
  // Breadcrumb Handler Middleware
  app.use(function(req, res, next) {
    req.breadcrumbs = get_breadcrumbs(req.originalUrl);
    next();
  });

  // Uptime Robot or Ping Service URL
  app.get("/ping", (req, res, next) => {
    res.send('DiscordBot/Dashboard Heartbeat Endpoint. Nothing to see here. :)')
  })

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
    logger.debug("Checking req.user.id against owner IDs")
    logger.data(`client.options.owner => ${client.options.owner}`);
    logger.data(`data type: ${typeof client.options.owner}`);
    // Check if request user ID is an owner.
    (client.options.owner.includes(req.user.id)) ? req.session.isAdmin = true : req.session.isAdmin = false;
    if (req.session.isAdmin) {
      logger.debug(`DiscordUser with ID:${req.user.id} logged in as 'ADMIN'.`)
    } else {
      logger.debug(`DiscordUser with ID:${req.user.id} logged in as 'USER'.`)
    }
    req.flash("success", "Authenticated/Action Successful!");
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  });

  // Error Message - Show this if auth fails or action is interrupted.
  app.get("/autherror", (req, res) => {
    renderView(res, req, "autherr.pug");
  });

  // Logout Endpoint - Destroys the session to log out the user.
  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout(); 
      req.flash('info', 'You have now been logged out of the dashboard.');
      res.redirect("/"); //Inside a callback… bulletproof!
    });
  });

  // Dashboard Routes - Public and Authenticated site endpoints.

  // Regular Information Pages (public pages)
  app.get("/", (req, res) => {
    renderView(res, req, "index.pug");
  });
  /*
  app.get("/commands", (req, res) => {
    var groups = client.registry.groups;
    var allcmds = `${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden)).map(grp => `
      ${grp.name} ${grp.commands.filter(cmd => !cmd.hidden).map(cmd => `
        ${cmd.name}: ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('')
      }`).join('\r\n')
      }`
    logger.data(`allcmds:${typeof (allcmds)}`);
    renderView(res, req, "cmds.pug", {
      all_commands: allcmds
    });
  });
  */
  app.get("/stats", (req, res) => {
    const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    const members = client.guilds.cache.reduce((p, c) => p + c.memberCount, 0);
    const textChannels = client.channels.cache.filter(c => c.type === "text").size;
    const voiceChannels = client.channels.cache.filter(c => c.type === "voice").size;
    const totalGuilds = client.guilds.cache.size;
    renderView(res, req, "stats.pug", {
      stats: {
        servers: totalGuilds,
        members: members,
        text: textChannels,
        voice: voiceChannels,
        uptime: duration,
        memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        botVer: version,
        discordVer: Discord.version,
        nodeVer: process.version
      }
    })
  });

  // DISABLED TEMPORARILY! REQUIRES STORAGE REWORK!

  // Authentication Locked Pages (Discord Oauth2)
  /* 
  // Normal Dashboard - Only shows user the guilds they are bound to.
  app.get("/dashboard", checkAuth, (req, res) => {
    //const perms = Discord.EvaluatedPermissions; //depreciated in discord.js v12+
    const perms = Discord.Permissions;
    renderView(res, req, "dash.pug", { perms });
  });

  // Admin Dashboard - Shows all guilds the bot is connected to, including ones not joined by the user.
  app.get("/admin", checkAuth, (req, res) => {
    let botSettings = client.settings.get("botSettings", undefined);
    if (!req.session.isAdmin) return res.redirect("/");
    renderView(res, req, "admin.pug", {botSettings});
  });

  app.get("/admin/reset_settings", checkAuth, (req,res) => {
    // Fetch all settings templates from ./core/assets/text/
    var clientSettingsTemplate = fs.readFileSync('./core/assets/text/clientDefaultSettings.txt', 'utf-8');    
    var guildSettingsTemplate = fs.readFileSync('./core/assets/text/guildDefaultSettings.txt', 'utf-8');
    // Attempt to parse to a usable Array of objects.
    let clientSettings = JSON.parse("["+clientSettingsTemplate+"]");
    let guildSettings = JSON.parse("["+guildSettingsTemplate+"]");
    // Clear client settings and reset to default. (has no settings yet)
    client.settings.clear();
    clientSettings.forEach(setting => {
      logger.data(`Generating setting ${setting.name} in client settings.`)
      client.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} in client settings`));
    });
    // Fetch all guilds before running through them one by one.
    const Guilds = client.guilds.cache.map(guild => guild);
    Guilds.forEach(guild => {
      // Remove the guild's settings.
      guild.settings.clear();
      // Apply default settings using guild as reference for configuration.
      guildSettings.forEach(setting => {
        logger.data(`Generating setting ${setting.name} for ${guild.name}`)
        guild.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
      });
      logger.debug(`${guild.name} settings reset!`);
    });
    logger.debug('Finished resetting all settings.')
    req.flash('warning', "Endpoint/Action is not yet implemented!");
    res.redirect('/admin');
  });
  app.post("/admin/save_clsettings", checkAuth, (req, res) => {
    logger.data(JSON.stringify(req.body));
    client.commandPrefix = (req.body.botPrefix) ? req.body.botPrefix : client.options.commandPrefix;
    let moduleControl = {
      enableAutoMod: (req.body.enableAutoMod) ? true : false,
      enableChatBot: (req.body.enableChatBot) ? true : false,
      enableNotifier: (req.body.enableNotifier) ? true : false,
      enableBotLogs: (req.body.enableBotLogs) ? true : false,
      enableModLogs: (req.body.enableModLogs) ? true : false
    };
    client.settings.set("moduleControl", moduleControl);
    req.flash('success', 'Saved preferences successfully!');
    res.redirect('/admin');
  })
  // Simple redirect to the "Settings" page (aka "manage")
  app.get("/dashboard/:guildID", checkAuth, (req, res) => {
    res.redirect(`/dashboard/${req.params.guildID}/manage`);
  });
  // Settings page to change the guild configuration. Definitely more fancy than using
  // the `set` command!
  app.get("/dashboard/:guildID/manage", checkAuth, (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    let 
      announcerSettings = guild.settings.get('announcer', undefined),
      autoModSettings = guild.settings.get('automod', undefined),
      chatBotSettings = guild.settings.get('chatbot', undefined),
      botLogSettings = guild.settings.get('botlogger', undefined),
      modLogSettings = guild.settings.get('modlogger', undefined);
    let settings = {announcerSettings, autoModSettings, chatBotSettings, botLogSettings, modLogSettings};
    renderView(res, req, "guild/manage.pug", {guild, settings});
  });
  // This calls when settings are saved using POST requests to get parameters to save.
  app.post("/dashboard/:guildID/manage", checkAuth, (req, res) => {
    logger.debug("WebDash called POST action 'save_settings'!");
    logger.data(`req.body => ${JSON.stringify(req.body)}`);
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    // Fetch Main Module Settings
    let announcerSettings = guild.settings.get('announcer', undefined);
    let autoModSettings = guild.settings.get('automod', undefined);
    let chatBotSettings = guild.settings.get('chatbot', undefined);
    // Fetch Channel Logs Module Settings
    let botLogSettings = guild.settings.get('botlogger', undefined);
    let modLogSettings = guild.settings.get('modlogger', undefined);
    // Use try/catch to capture errors from the bot or dashboard.
    try {
      // Update each setting setup respectively and save changes.
      if (req.body.enableNotifier) {
        logger.debug("Detected 'Announcer' settings data!");
        announcerSettings.enableNotifier = (req.body.enableNotifier === 'on') ? true : false;
        announcerSettings.notifsChannel = (req.body.notifsChannel) ? req.body.notifsChannel : '';
        announcerSettings.events = {
          join: (req.body.userJoin) ? true : false,
          leave: (req.body.userLeave) ? true : false,
          kick: (req.body.userKick) ? true : false,
          ban: (req.body.userBan) ? true : false
        };
        logger.debug("Prepared 'Announcer' settings data for writing.");
      };    
      if (req.body.enableAutoMod) {
        logger.debug("Detected 'AutoMod' settings data!");
        autoModSettings.enableAutoMod = (req.body.enableAutoMod === 'on') ? true : false;
        let channelsList = req.body.channelsList;
        autoModSettings.chListMode = (req.body.chListMode) ? req.body.chListMode : autoModSettings.chListMode;
        autoModSettings.channelsList = (req.body.channelsList) ? channelsList : autoModSettings.channelsList;
        autoModSettings.mediaOptions = {
          removeUrls: (req.body.removeUrls) ? true : false,
          removeGifs: (req.body.removeGifs) ? true : false,
          removeImgs: (req.body.removeImgs) ? true : false,
          removeVids: (req.body.removeVids) ? true : false
        }
        logger.debug("Prepared 'AutoMod' settings data for writing.");
      };
      if (req.body.enableChatBot) {
        logger.debug("Detected 'ChatBot' settings data!");
        chatBotSettings.enableChatBot = (req.body.enableChatBot === 'on') ? true : false;
        let chatBotUser = {
          botName: (req.body.botName) ? req.body.botName : "Cora",
          botGender: (req.body.botGender) ? req.body.botGender : "female"
        };
        let chatChannels = req.body.chatChannels;
        logger.debug(`chatBotUser=${JSON.stringify(chatBotUser)}`);
        logger.debug(`chatChannels=${JSON.stringify(chatChannels)}`);
        chatBotSettings.chatBotUser = chatBotUser;
        chatBotSettings.chatChannels = chatChannels;
        logger.debug("Prepared 'ChatBot' settings data for writing.");
      };
      if (req.body.enableBotLogger) {
        logger.debug("Detected 'BotLogger' settings data!");
        // to be implemented ;)
        logger.debug("Prepared 'BotLogger' settings data for writing.");
      };
      if (req.body.enableModLogger) {
        logger.debug("Detected 'ModLogger' settings data!");
        // to be implemented ;)
        logger.debug("Prepared 'ModLogger' settings data for writing.");
      }
      // Debug data dump here.
      logger.debug('Dumping data into debug logs.')
      logger.data(`announcerSettings: ${JSON.stringify(announcerSettings)}`);
      logger.data(`autoModSettings: ${JSON.stringify(autoModSettings)}`);
      logger.data(`chatBotSettings: ${JSON.stringify(chatBotSettings)}`);
      // Update settings after checking for changes.
      guild.settings.set('announcer', announcerSettings);
      guild.settings.set('automod', autoModSettings);
      guild.settings.set('chatbot', chatBotSettings);
      req.flash('success', 'Saved settings successfully!');
    } catch (err) {
      // Should it fail, catch and try to log the error from the bot/dashboard.
      logger.warn('A setting failed to save correctly! Aborting settings change.');
      logger.error(err.message); logger.debug(err.stack);
      req.flash('danger', 'One or more settings failed to save! Please try again. If this error persists, ask an admin to check the logs.');
    };
    logger.debug("Finished updating settings database. Redirecting to dashboard manage page.");
    res.redirect("/dashboard/" + req.params.guildID + "/manage");
  });
  // Displays all members in the Discord guild being viewed.
  app.get("/dashboard/:guildID/members", checkAuth, (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    let members = guild.members.cache.array()
    renderView(res, req, "guild/members.pug", {guild, members});
  });
  
  // Leaves the guild (this is triggered from the manage page, and only
  // from the modal dialog)
  app.get("/dashboard/:guildID/leave", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    logger.dash(`WebDash called GUILD_LEAVE action for guild ${guild.name}.`);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    await guild.leave();
    req.flash("success", `Removed from ${guild.name} successfully!`);
    res.redirect("/dashboard");
  });

  // Resets the guild's settings to the defaults, by simply deleting them.
  app.get("/dashboard/:guildID/reset", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    logger.dash(`WebDash called RESET_SETTINGS action on guild ${guild.name}.`);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    logger.debug(`WebDash executed RESET for ${guild.name} settings!`)
    // Clean up existing settings in the bot's database for guild.
    guild.settings.clear(guild.id);
    // Get settings template here from bot assets/text/ directory.
    let settingsTemplate = fs.readFileSync('./core/assets/text/defaultSettings.txt', 'utf-8');
    let defaultSettings = JSON.parse("[" + settingsTemplate + "]");
    defaultSettings.forEach(setting => {
      logger.data(`Re-generating setting ${setting.name} for ${guild.name}`)
      guild.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
    });
    // Once this completes, call redirect to dashboard page.
    req.flash("success", "Settings Reset Complete!");
    res.redirect("/dashboard/"+req.params.guildID);
  });

  // Kicks specified member by their unique user ID.
  app.get("/dashboard/:guildID/kick/:userID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    const member = guild.members.cache.get(req.params.userID);
    if (!guild) return res.status(404);
    logger.dash(`WebDash called USER_KICK action on user ${member.user.id} in guild ${guild.name}.`);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    if (req.params.userID === client.user.id || req.params.userID === req.user.id) {
      req.flash("warning", `Unable to kick ${member.user.tag}. Insufficient permissions or action was rejected by bot server.`);
      logger.warn(`WebDash Operator BAN ${member.user.tag} aborted by DashService!`);
      logger.warn(`Reason: The requested MemberID of ${member.user.tag}was the User's or Bot's unique ID.`);
    } else {
      member.kick(`Kicked by WebDash Operator (ID :${req.user.id})`)
        .then(req.flash("success", `${member.user.tag} has been removed from ${guild.name} successfully!`))
      .catch(err => {
        req.flash("danger", `Could not kick ${member.user.tag} due to missing permissions or another error occured.`)
        logger.warn(`WebDash Operator KICK ${member.user.tag} failed.`)
        logger.error(err); logger.debug(err.stack);
      });
    }
    res.redirect("/dashboard");
  });
  // Bans specified member by their unique user ID.
  app.get("/dashboard/:guildID/ban/:userID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    const member = guild.members.cache.get(req.params.userID);
    if (!guild) return res.status(404);
    logger.dash(`WebDash called USER_BAN action on user ${member.user.id} in guild ${guild.name}.`);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    if (req.params.userID === client.user.id || req.params.userID === req.user.id) {
      req.flash("warning", `Unable to kick ${member.user.tag}. Insufficient permissions or action was rejected by bot server.`)
      logger.warn(`WebDash Operator BAN ${member.user.tag} aborted by DashService!`)
      logger.warn(`Reason: The requested MemberID of ${member.user.tag}was the User's or Bot's unique ID.`)
    } else {
      member.ban({days: 7, reason: `Banned by Dashboard Operator (ID: ${req.user.id})`})
        .then(req.flash("success", `Banned ${member.user.tag} Successfully!`))
      .catch(err => {
        req.flash("danger", `Could not ban ${member.user.tag} due to missing permissions or another error occured.`)
        logger.warn(`WebDash Operator BAN ${member.user.tag} failed.`)
        logger.error(err); logger.debug(err.stack);
      });
    req.flash("success", `Removed from ${guild.name} successfully!`);
    }
    res.redirect("/dashboard");
  });
  */
  // DISABLED TEMPORARILY! REQUIRES STORAGE REWORK!

  // Fallback Middleware.

  // 404 Not Found Handler (Only occurs if no error was thrown)
  app.use(function(req, res, next) {
    res.status(404);
    renderView(res, req, 'errors/404.pug');
  });

  // Error Handling
  app.use(function(err, req, res, next) {
    logger.debug('Error occured in dashboard service!');
    if (err.message.indexOf('Failed to lookup view') !== -1) {
      req.flash("danger", "Error occured while attempting to render template! A requested template asset file is missing or was not found. Please contact my owner for help.");
      logger.debug(`Error! Missing asset file!`);
      logger.debug(err.stack);
      return res.status(404), renderView(res, req, 'errors/404.pug');
    }
    else 
    if (err.code === 'ERR_HTTP_HEADERS_SENT') {
      logger.warn('Server tried to send more than one header to client!');
      logger.debug('Too many headers sent or called by dashboard service!');
      logger.debug(err.stack);
      return;
    }
    else {
      res.status(500);
      renderView(res, req, 'errors/500.pug');
      logger.error(err); logger.debug(err.stack);
    }
  });
  app.listen(config.dashPort, () => {
    logger.dash(`Dashboard service running on port ${config.dashPort}`);
  });
};