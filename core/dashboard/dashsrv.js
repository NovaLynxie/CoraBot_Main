// Native Node Imports
const url = require('url'), path = require('path'), fs = require('fs');

// Fetch Bot version
const { version } = require('../../package.json');

// Winston Logger Plugin
const logger = require('../plugins/winstonLogger');

// For Discord Permission Handling
const Discord = require('discord.js');

// Express Session
const express = require('express');
const app = express();
const moment = require('moment');
require('moment-duration-format');
// Express Plugins
const morgan = require('morgan'); // server-side logger
const passport = require('passport'); // oauth2 helper plugin
const helmet = require('helmet'); // security plugin
const session = require('express-session'); // express session manager
const SQLiteStore = require('connect-sqlite3')(session);
const DiscordStrategy = require('passport-discord-faxes').Strategy;

logger.dash('Starting Dashboard Service...');

module.exports = (client, config) => {
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
	if (config.debug) {
		app.use(morgan('tiny', {
			stream: {
				write: message => logger.debug(`dash => ${message}`),
			},
		}));
	}
	// Dashboard root directory from bot working directory.
	const dashDir = path.resolve(`${process.cwd()}/core/dashboard`);
	// Public and Views resource paths within Dashboard directory.
	const viewsDir = path.resolve(`${dashDir}/views/`);
	const publicDir = path.resolve(`${dashDir}/public/`);
	app.use('/public', express.static(publicDir));
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
	// Session Data
	// This is used for temporary storage of your visitor's session information. It contains secrets that should not be shared publicly.
	app.use(session({
		// session storage location
		store: new SQLiteStore({
			db: 'sessions.db',
			dir: './data/',
		}),
		// session secret - verification step
		secret: process.env.SESSION_SECRET || config.sessionSecret,
		// session cookie - remove after one week elapses
		// cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, //disabled temporarily
		// session options
		resave: false,
		saveUninitialized: false,
		unset: 'destroy',
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
				defaultSrc: ['\'self\'', 'https:'],
				scriptSrc: [
					'\'self\'', 'https:', '\'unsafe-inline\'', '*.jquery.com', '*.cloudflare.com', '*.bootstrapcdn.com', '*.datatables.net', '*.jsdelivr.net', '*.googleapis.com', '\'nonce-themeLoader\'', '\'nonce-memberModals\'',
				],
				fontSrc: [
					'\'self\'', 'https:', 'fonts.googleapis.com',
					'*.gstatic.com', 'maxcdn.bootstrapcdn.com',
				],
				styleSrc: [
					'\'self\'', 'https:', '\'unsafe-inline\'', '*.bootstrapcdn.com', '*.googleapis.com',
				],
				imgSrc: [
					'\'self\'', 'https:', 'http:', 'data:', 'w3.org', 'via.placeholder.com', 'cdn.discordapp.com', 'i.giphy.com', 'media.tenor.com',
				],
				objectSrc: ['\'none\''],
				// supported by some browsers (firefox doesn't at this time)
				scriptSrcElem: [
					'\'self\'', 'https:', '\'unsafe-inline\'', '\'nonce-themeLoader\'', '\'nonce-memberModals\'', '*.jquery.com', '*.cloudflare.com', '*.bootstrapcdn.com', '*.datatables.net', '*.jsdelivr.net',
				],
				scriptSrcAttr: [
					'\'self\'', 'https:',
				],
				styleSrcElem: [
					'\'self\'', 'https:', '*.bootstrapcdn.com', '*.googleapis.com',
				],
				upgradeInsecureRequests: [],
			},
			// used for debugging purposes to determine if csp is working.
			reportOnly: config.reportOnly || false,
		},
	}));

	// The PUG templating engine allows for simpler setups and easy to read formatting in pages.
	// It allows us separate header and footer components.
	app.set('view engine', 'pug');

	// The EJS templating engine gives us more power to create complex web pages.
	// This lets us have a separate header, footer, and "blocks" we can use in our pages.
	// app.engine("html", require("ejs").renderFile);
	// app.set("view engine", "html");

	// body-parser reads incoming JSON or FORM data and simplifies their
	// use in code.
	app.use(express.json()); // to support JSON-encoded bodies
	app.use(express.urlencoded({ // to support URL-encoded bodies
		extended: true,
	}));

	// flash used for displaying alert messages
	app.use(require('flash')());
	/*
  Authentication Checks. For each page where the user should be logged in, double-checks whether the login is valid and the session is still active.
  */
	function checkAuth(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		}
		else {
			logger.debug(`req.url='${req.url}'`);
			req.session.backURL = req.url; res.status(401);
			logger.debug(`req.session.backURL='${req.session.backURL}'`);
			res.redirect('/login');
		}
	}
	/*
  Manage Server permission checks. This is a common check for all endpoints which need to confirm that the operator can edit the server region, roles, permissions, members, etc.
  */
	function isManaged(guild, dashuser) {
		const member = guild.members.cache.get(dashuser.id);
		const res = member.permissions.has('MANAGE_GUILD');
		return res;
	}
	/*
  Breadcrumb Fetcher. This uses the current page URL from ‘req’ to create breadcrumbs as an array of crumb objects, which is added to ‘req’.
  Source: https://vidler.app/blog/javascript/nodejs/simple-and-dynamic-breadcrumbs-for-a-nodejs-express-application/
  */
	function get_breadcrumbs(url) {
		let rtn = [{ name: 'HOME', url: '/' }],
			acc = '', // accumulative url
			arr = url.substring(1).split('/');

		for (i = 0; i < arr.length; i++) {
			acc = i != arr.length - 1 ? acc + '/' + arr[i] : null;
			rtn[i + 1] = { name: arr[i].toUpperCase(), url: acc };
		}
		return rtn;
	}
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

	// Breadcrumb Handler Middleware
	app.use(function(req, res, next) {
		req.breadcrumbs = get_breadcrumbs(req.originalUrl);
		next();
	});

	// Uptime Robot or Ping Service URL
	app.get('/ping', (req, res, next) => {
		res.send('DiscordBot/Dashboard Heartbeat Endpoint. Nothing to see here. :)');
	});

	// Dashboard Actions - All Interaction & Authentication actions.

	// Login Endpoint
	// Sends user to authenticate via discord oauth2.
	app.get('/login', (req, res, next) => {
		if (req.session.backURL) {
			next();
		}
		else if (req.headers.referer) {
			const parsed = url.parse(req.headers.referer);
			if (parsed.hostname === app.locals.domain) {
				req.session.backURL = parsed.path;
			}
		}
		else {
			req.session.backURL = '/';
		}
		next();
	},
	passport.authenticate('discord'));

	// OAuth2 Callback Endpoint
	// Once user returns, this is called to complete authorization.
	app.get('/api/discord/callback', passport.authenticate('discord', { failureRedirect: '/autherror' }), (req, res) => {
		logger.debug(`Checking req.user.id ${req.user.id} against owner IDs`);
		logger.data(`client.options.owners => ${client.options.owners}`);
		logger.data(`data type: ${typeof client.options.owners}`);
		// Check if request user ID is an owner.
		(client.options.owners.includes(req.user.id)) ? req.session.isAdmin = true : req.session.isAdmin = false;
		if (req.session.isAdmin) {
			logger.debug(`DiscordUser with ID:${req.user.id} logged in as 'ADMIN'.`);
		}
		else {
			logger.debug(`DiscordUser with ID:${req.user.id} logged in as 'USER'.`);
		}
		req.flash('success', 'Authenticated/Action Successful!');
		if (req.session.backURL) {
			const url = req.session.backURL;
			req.session.backURL = null;
			res.redirect(url);
		}
		else {
			res.redirect('/');
		}
	});

	// Error Message - Show this if auth fails or action is interrupted.
	app.get('/autherror', (req, res) => {
		renderView(res, req, 'autherr.pug');
	});

	// Logout Endpoint - Destroys the session to log out the user.
	app.get('/logout', function(req, res) {
		req.session.destroy(() => {
			req.logout();
			req.flash('info', 'You have now been logged out of the dashboard.');
			res.redirect('/'); // Inside a callback… bulletproof!
		});
	});

	// Dashboard Routes - Public and Authenticated site endpoints.

	// Regular Information Pages (public pages)
	app.get('/', (req, res) => {
		renderView(res, req, 'index.pug');
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
	app.get('/stats', (req, res) => {
		const duration = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
		const members = client.guilds.cache.reduce((p, c) => p + c.memberCount, 0);
		const textChannels = client.channels.cache.filter(c => c.type === 'GUILD_TEXT').size;
		const voiceChannels = client.channels.cache.filter(c => c.type === 'GUILD_VOICE').size;
		const totalGuilds = client.guilds.cache.size;
		renderView(res, req, 'stats.pug', {
			stats: {
				servers: totalGuilds,
				members: members,
				text: textChannels,
				voice: voiceChannels,
				uptime: duration,
				memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
				botVer: version,
				discordVer: Discord.version,
				nodeVer: process.version,
			},
		});
	});

	// DISABLED TEMPORARILY! REQUIRES STORAGE REWORK!

	// Authentication Locked Pages (Discord Oauth2)

	// Normal Dashboard - Only shows user the guilds they are bound to.
	app.get('/dashboard', checkAuth, (req, res) => {
		// const perms = Discord.EvaluatedPermissions; //depreciated in discord.js v12+
		const Permissions = Discord.Permissions;
		renderView(res, req, 'dash.pug', { Permissions });
	});

	// Admin Dashboard - Shows all guilds the bot is connected to, including ones not joined by the user.
	app.get('/admin', checkAuth, async (req, res) => {
		const botSettings = await client.settings.get(client);
		if (!req.session.isAdmin) return res.redirect('/');
		renderView(res, req, 'admin.pug', { botSettings });
	});
	app.get('/admin/reset_settings', checkAuth, async (req, res) => {
		// Clear client settings and reset to default. (has no settings yet)
		await client.settings.clear();
		await client.settings.init();
		/*
    clientSettings.forEach(setting => {
      logger.data(`Generating setting ${setting.name} in client settings.`)
      client.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} in client settings`));
    });
    */
		// Fetch all guilds before running through them one by one.
		const Guilds = client.guilds.cache.map(guild => guild);
		Guilds.forEach(async guild => {
			// Remove the guild's settings.
			await client.settings.guild.delete(guild);
			// Apply default settings using guild as reference for configuration.
			await client.settings.guild.init(guild);
			logger.debug(`${guild.name} settings reset!`);
		});
		logger.debug('Finished resetting all settings.');
		req.flash('success', 'Successfully reset all settings!');
		res.redirect('/admin');
	});
	app.post('/admin/save_clsettings', checkAuth, async (req, res) => {
		logger.data(JSON.stringify(req.body));
		let clsettings = await client.settings.get(client);
		clsettings = {
			enableModules: {
				autoMod: (req.body.enableAutoMod) ? true : false,
				chatBot: (req.body.enableChatBot) ? true : false,
				notifier: (req.body.enableNotifier) ? true : false,
				botLogs: (req.body.enableBotLogs) ? true : false,
				modLogs: (req.body.enableModLogs) ? true : false,
			},
		};
		client.settings.set(clsettings, client);
		req.flash('success', 'Saved preferences successfully!');
		res.redirect('/admin');
	});
	// Simple redirect to the "Settings" page (aka "manage")
	app.get('/dashboard/:guildID', checkAuth, (req, res) => {
		res.redirect(`/dashboard/${req.params.guildID}/manage`);
	});
	// Settings page to change the guild configuration.
	app.get('/dashboard/:guildID/manage', checkAuth, async (req, res) => {
		const guild = client.guilds.cache.get(req.params.guildID);
		const guildRoles = []; // prepare new array, then push one at a time.
		guild.roles.cache.forEach(role => guildRoles.push(role));
		if (!guild) return res.status(404);
		if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
		logger.debug(`Fetching guild settings for ${guild.name}.`);
		const guildSettings = await client.settings.guild.get(guild);
		logger.verbose(`guildSettings: ${JSON.stringify(guildSettings, null, 4)}`);
		renderView(res, req, 'guild/manage.pug', { guild, guildRoles, guildSettings });
	});

	// This calls when settings are saved using POST requests to get parameters to save.
	app.post('/dashboard/:guildID/manage', checkAuth, async (req, res) => {
		logger.debug('WebDash called POST action \'save_settings\'!');
		logger.data(`req.body => ${JSON.stringify(req.body)}`);
		const guild = client.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
		logger.debug('Preparing to update guildSettings.');
		const guildSettings = await client.settings.guild.get(guild);
		logger.verbose(`guildSettings: ${JSON.stringify(guildSettings, null, 4)}`);
		const { guildPrefix } = guildSettings;
		// Fetch Main Module Settings
		const { autoMod, chatBot, notifier, roles } = guildSettings;
		// Fetch Channel Logs Module Settings
		const { botLogger, modLogger } = guildSettings;
		// Use try/catch to capture errors from the bot or dashboard.
		try {
			if (req.body.staffRoles) {
				logger.debug('Detected \'staffRoles\' settings data!');
				const staffRoles = (typeof req.body.staffRoles === 'string') ? '[' + req.body.staffRoles + ']' : req.body.staffRoles;
				roles.staff = staffRoles;
			}
      if (req.body.muteRole) {
        logger.debug('Detected \'muteRole\' settings data!');
        const muteRole = req.body.muteRole;
        roles.mute = muteRole;
      }
			if (req.body.enableNotifier) {
				logger.debug('Detected \'notifier\' settings data!');
				notifier.enableNotifier = (req.body.enableNotifier === 'on') ? true : false;
				notifier.notifsChannel = (req.body.notifsChannel) ? req.body.notifsChannel : '';
				notifier.trackEvents = {
					join: (req.body.userJoin) ? true : false,
					leave: (req.body.userLeave) ? true : false,
					kick: (req.body.userKick) ? true : false,
					ban: (req.body.userBan) ? true : false,
				};
				logger.debug('Prepared \'notifier\' settings data for writing.');
			}
			if (req.body.enableAutoMod) {
				logger.debug('Detected \'autoMod\' settings data!');
				autoMod.enableAutoMod = (req.body.enableAutoMod === 'on') ? true : false;
				const channelsList = req.body.channelsList;
				const urlBlacklist = (req.body.urlBlacklist) ? req.body.urlBlacklist.split(' ') : [];
				autoMod.chListMode = (req.body.chListMode) ? req.body.chListMode : autoMod.chListMode;
				autoMod.channelsList = (req.body.channelsList) ? channelsList : autoMod.channelsList;
				autoMod.urlBlacklist = (urlBlacklist) ? urlBlacklist : autoMod.urlBlacklist;
				autoMod.mediaTrackers = {
					removeUrls: (req.body.removeUrls) ? true : false,
					removeGifs: (req.body.removeGifs) ? true : false,
					removeImgs: (req.body.removeImgs) ? true : false,
					removeVids: (req.body.removeVids) ? true : false,
				};
				logger.debug('Prepared \'autoMod\' settings data for writing.');
			}
			if (req.body.enableChatBot) {
				logger.debug('Detected \'chatBot\' settings data!');
				chatBot.enableChatBot = (req.body.enableChatBot === 'on') ? true : false;
				const chatBotOpts = {
					botName: (req.body.botName) ? req.body.botName : '',
					botGender: (req.body.botGender) ? req.body.botGender : '',
				};
				const chatChannels = (typeof req.body.chatChannels === 'string') ? '[' + req.body.chatChannels + ']' : req.body.chatChannels;
				logger.debug(`chatBotOpts=${JSON.stringify(chatBotOpts)}`);
				logger.debug(`chatChannels=${JSON.stringify(chatChannels)}`);
				chatBot.chatBotOpts = chatBotOpts;
				chatBot.chatChannels = (chatChannels) ? chatChannels : [];
				logger.debug('Prepared \'chatBot\' settings data for writing.');
			}
			if (req.body.enableBotLogger) {
				logger.debug('Detected \'BotLogger\' settings data!');
				// to be implemented ;)
				logger.debug('Prepared \'BotLogger\' settings data for writing.');
			}
			if (req.body.enableModLogger) {
				logger.debug('Detected \'ModLogger\' settings data!');
				// to be implemented ;)
				logger.debug('Prepared \'ModLogger\' settings data for writing.');
			}
			// Verbose outputs here for debugging.
			logger.verbose('-------------------------------------------------');
			logger.verbose(`guildSettings: ${JSON.stringify(guildSettings, null, 4)}`);
			logger.verbose(`autoMod: ${JSON.stringify(autoMod, null, 4)}`);
			logger.verbose(`chatBot: ${JSON.stringify(chatBot, null, 4)}`);
			logger.verbose(`notifier: ${JSON.stringify(notifier, null, 4)}`);
			logger.verbose('-------------------------------------------------');
			// Update settings after checking for changes.
			await client.settings.guild.set(guildSettings, guild);
			logger.debug('Saved guild settings successfully!');
			req.flash('success', 'Saved settings successfully!');
		}
		catch (err) {
			// Should it fail, catch and try to log the error from the bot/dashboard.
			logger.warn('A setting failed to save correctly! Aborting settings change.');
			logger.error(err.message); logger.debug(err.stack);
			req.flash('danger', 'One or more settings failed to save! Please try again. If this error persists, ask an admin to check the logs.');
		}
		logger.debug('Redirecting to dashboard manage page.');
		res.redirect('/dashboard/' + req.params.guildID + '/manage');
	});

	// Displays all members in the Discord guild being viewed.
	app.get('/dashboard/:guildID/members', checkAuth, (req, res) => {
		const guild = client.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
		const members = Array.from(guild.members.cache.values());
		renderView(res, req, 'guild/members.pug', { guild, members });
	});
	// Leaves the guild (this is triggered from the manage page, and only
	// from the modal dialog)
	app.get('/dashboard/:guildID/leave', checkAuth, async (req, res) => {
		const guild = client.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		logger.dash(`WebDash called GUILD_LEAVE action for guild ${guild.name}.`);
		if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
		await guild.leave();
		req.flash('success', `Removed from ${guild.name} successfully!`);
		res.redirect('/dashboard');
	});
	/*
  // Resets the guild's settings to the defaults, by simply deleting them.
  app.get("/dashboard/:guildID/reset", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    logger.dash(`WebDash called RESET_SETTINGS action on guild ${guild.name}.`);
    if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect("/");
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
  */
	// DISABLED TEMPORARILY! REQUIRES STORAGE REWORK!

	// Kicks specified member by their unique user ID.
	app.get('/dashboard/:guildID/kick/:userID', checkAuth, async (req, res) => {
		const guild = client.guilds.cache.get(req.params.guildID);
		const member = guild.members.cache.get(req.params.userID);
		if (!guild) return res.status(404);
		logger.dash(`WebDash called USER_KICK action on user ${member.user.id} in guild ${guild.name}.`);
		if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
		if (req.params.userID === client.user.id || req.params.userID === req.user.id) {
			req.flash('warning', `Unable to kick ${member.user.tag}. Insufficient permissions or action was rejected by bot server.`);
			logger.warn(`WebDash Operator BAN ${member.user.tag} aborted by DashService!`);
			logger.warn(`Reason: The requested MemberID of ${member.user.tag}was the User's or Bot's unique ID.`);
		}
		else {
			member.kick(`Kicked by WebDash Operator (ID :${req.user.id})`)
				.then(req.flash('success', `${member.user.tag} has been removed from ${guild.name} successfully!`))
				.catch(err => {
					req.flash('danger', `Could not kick ${member.user.tag} due to missing permissions or another error occured.`);
					logger.warn(`WebDash Operator KICK ${member.user.tag} failed.`);
					logger.error(err); logger.debug(err.stack);
				});
		}
		res.redirect('/dashboard');
	});
	// Bans specified member by their unique user ID.
	app.get('/dashboard/:guildID/ban/:userID', checkAuth, async (req, res) => {
		const guild = client.guilds.cache.get(req.params.guildID);
		const member = guild.members.cache.get(req.params.userID);
		if (!guild) return res.status(404);
		logger.dash(`WebDash called USER_BAN action on user ${member.user.id} in guild ${guild.name}.`);
		const isManaged = member.permissions.has('MANAGE_GUILD');
		if (!isManaged && !req.session.isAdmin) res.redirect('/');
		if (req.params.userID === client.user.id || req.params.userID === req.user.id) {
			req.flash('warning', `Unable to kick ${member.user.tag}. Insufficient permissions or action was rejected by bot server.`);
			logger.warn(`WebDash Operator BAN ${member.user.tag} aborted by DashService!`);
			logger.warn(`Reason: The requested MemberID of ${member.user.tag}was the User's or Bot's unique ID.`);
		}
		else {
			member.ban({ days: 7, reason: `Banned by Dashboard Operator (ID: ${req.user.id})` })
				.then(req.flash('success', `Banned ${member.user.tag} Successfully!`))
				.catch(err => {
					req.flash('danger', `Could not ban ${member.user.tag} due to missing permissions or another error occured.`);
					logger.warn(`WebDash Operator BAN ${member.user.tag} failed.`);
					logger.error(err); logger.debug(err.stack);
				});
			req.flash('success', `Removed from ${guild.name} successfully!`);
		}
		res.redirect('/dashboard');
	});

	// Fallback Middleware.

	// 404 Not Found Handler (Only occurs if no error was thrown)
	app.use(function(req, res, next) {
		res.status(404);
		renderView(res, req, 'errors/404.pug');
	});

	// Error Handling
	app.use(function(err, req, res, next) {
		logger.debug('Error occured in dashboard service!');
		logger.verbose(err); // only show this if logLevel is set to verbose.
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
		}
		else
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