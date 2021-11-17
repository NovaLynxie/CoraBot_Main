const fs = require('fs');
const { stripIndents } = require('common-tags');
const { formatDistance } = require('date-fns');
const logger = require('../../utils/winstonLogger');
const { Permissions } = require('discord.js');
const { checkAuth, isManaged, renderView } = require('../dashUtils');

const express = require('express');
const router = express.Router();

router.get('/', checkAuth, (req, res) => {
  renderView(res, req, 'dash.pug', { Permissions });
});
router.get('/admin', checkAuth, async (req, res) => {
  const client = res.locals.client;
  const botSettings = await client.settings.get(client);
  if (!req.session.isAdmin) return res.redirect('/');
  renderView(res, req, 'admin.pug', { botSettings });
});
router.get('/admin/reset_settings', checkAuth, async (req, res) => {
  const client = res.locals.client;
  await client.settings.clear();
  await client.settings.init();
  const Guilds = client.guilds.cache.map(guild => guild);
  Guilds.forEach(async guild => {
    await client.settings.guild.delete(guild);
    await client.settings.guild.init(guild);
    logger.debug(`${guild.name} settings reset!`);
  });
  logger.debug('Finished resetting all settings.');
  req.flash('success', 'Successfully reset all settings!');
  res.redirect('/admin');
});
router.post('/admin/save_clsettings', checkAuth, async (req, res) => {
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
  res.redirect('/dashboard/admin');
});
router.get('/:guildID', checkAuth, (req, res) => {
  res.redirect(`/dashboard/${req.params.guildID}/manage`);
});
router.get('/:guildID/manage', checkAuth, async (req, res) => {
  const client = res.locals.client;
  const guild = await client.guilds.fetch(req.params.guildID);
  const guildRoles = [];
  guild.roles.cache.forEach(role => guildRoles.push(role));
  if (!guild) return res.status(404);
  if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
  logger.debug(`Fetching guild settings for ${guild.name}.`);
  const guildSettings = await client.settings.guild.get(guild);
  logger.verbose(`guildSettings: ${JSON.stringify(guildSettings, null, 4)}`);
  renderView(res, req, 'guild/manage.pug', { guild, guildRoles, guildSettings });
});
router.post('/:guildID/manage', checkAuth, async (req, res) => {
  logger.debug(`WebDash called POST action 'save_settings'!`);
  logger.data(`req.body => ${JSON.stringify(req.body)}`);
  const client = res.locals.client;
  const guild = client.guilds.cache.get(req.params.guildID);
  if (!guild) return res.status(404);
  if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
  logger.debug('Preparing to update guildSettings.');
  const guildSettings = await client.settings.guild.get(guild);
  logger.verbose(`guildSettings: ${JSON.stringify(guildSettings, null, 4)}`);
  const { autoMod, chatBot, notifier, roles, logChannels } = guildSettings;
  const { botLogger, modLogger } = guildSettings;
  try {
    function emptyStringCheck(item) {
      let res = (item === '') ? null : item;
      return res;
    };
    logger.debug('Scanning request body for settings data...');
    if (req.body.staffRoles) {
      logger.debug(`Detected 'staffRoles' settings data!`);
      const staffRoles = (typeof req.body.staffRoles === 'string') ? [`${req.body.staffRoles}`] : req.body.staffRoles;
      roles.staff = staffRoles;
    }      
    if (req.body.muteRole) {
      logger.debug(`Detected 'muteRole' settings data!`);
      roles.mute = emptyStringCheck(req.body.muteRole);
    }
    if (req.body.botLogChID) {
      logger.debug(`Detected 'botLogChID' settings data!`);
      logChannels.botLogChID = emptyStringCheck(req.body.botLogChID);
    }
    if (req.body.modLogChID) {
      logger.debug(`Detected 'modLogChID' settings data!`);
      logChannels.modLogChID = emptyStringCheck(req.body.modLogChID);
    }
    if (req.body.suggestChID) {
      logger.debug(`Detected 'suggestChID' settings data!`);
      logChannels.suggestChID = emptyStringCheck(req.body.suggestChID);
    }
    if (req.body.ticketsChID) {
      logger.debug(`Detected 'ticketsChID' settings data!`);
      logChannels.ticketsChID = emptyStringCheck(req.body.ticketsChID);
    }
    if (req.body.enableNotifier) {
      logger.debug(`Detected 'notifier' settings data!`);
      notifier.enableNotifier = (req.body.enableNotifier === 'on') ? true : false;
      notifier.notifsChannel = (req.body.notifsChannel) ? req.body.notifsChannel : '';
      notifier.trackEvents = {
        join: (req.body.userJoin) ? true : false,
        leave: (req.body.userLeave) ? true : false,
        kick: (req.body.userKick) ? true : false,
        ban: (req.body.userBan) ? true : false,
      };
      logger.debug(`Prepared 'notifier' settings data for writing.`);
    }
    if (req.body.enableAutoMod) {
      logger.debug(`Detected 'autoMod' settings data!`);
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
      logger.debug(`Prepared 'autoMod' settings data for writing.`);
    }
    if (req.body.enableChatBot) {
      logger.debug(`Detected 'chatBot' settings data!`);
      chatBot.enableChatBot = (req.body.enableChatBot === 'on') ? true : false;
      const chatBotOpts = {
        botName: (req.body.botName) ? req.body.botName : '',
        botGender: (req.body.botGender) ? req.body.botGender : '',
      };
      const chatChannels = (typeof req.body.chatChannels === 'string') ? [`${req.body.chatChannels}`] : req.body.chatChannels;
      logger.debug(`chatBotOpts=${JSON.stringify(chatBotOpts)}`);
      logger.debug(`chatChannels=${JSON.stringify(chatChannels)}`);
      chatBot.chatBotOpts = chatBotOpts;
      chatBot.chatChannels = (chatChannels) ? chatChannels : [];
      logger.debug(`Prepared 'chatBot' settings data for writing.`);
    };
    logger.verbose('-------------------------------------------------');
    logger.verbose(`guildSettings: ${JSON.stringify(guildSettings, null, 4)}`);
    logger.verbose(`autoMod: ${JSON.stringify(autoMod, null, 4)}`);
    logger.verbose(`chatBot: ${JSON.stringify(chatBot, null, 4)}`);
    logger.verbose(`notifier: ${JSON.stringify(notifier, null, 4)}`);
    logger.verbose('-------------------------------------------------');
    await client.settings.guild.set(guildSettings, guild);
    logger.debug('Saved guild settings successfully!');
    req.flash('success', 'Saved settings successfully!');
  } catch (err) {
    logger.warn('A setting failed to save correctly! Aborting settings change.');
    logger.error(err.message); logger.debug(err.stack);
    req.flash('danger', 'One or more settings failed to save! Please try again. If this error persists, ask an admin to check the logs.');
  }
  logger.debug('Redirecting to dashboard manage page.');
  res.redirect(`/dashboard/${req.params.guildID}/manage`);
});
router.get('/:guildID/members', checkAuth, (req, res) => {
  const client = res.locals.client;
  const guild = client.guilds.cache.get(req.params.guildID);
  if (!guild) return res.status(404);
  if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
  const members = Array.from(guild.members.cache.values());
  renderView(res, req, 'guild/members.pug', { guild, members });
});
router.get('/:guildID/leave', checkAuth, async (req, res) => {
  const client = res.locals.client;
  const guild = client.guilds.cache.get(req.params.guildID);
  if (!guild) return res.status(404);
  logger.debug(`WebDash called GUILD_LEAVE action for guild ${guild.name}.`);
  if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
  await guild.leave();
  req.flash('success', `Removed from ${guild.name} successfully!`);
  res.redirect('/dashboard');
});
router.get("/:guildID/reset", checkAuth, async (req, res) => {
  const client = res.locals.client;
  const guild = client.guilds.cache.get(req.params.guildID);
  if (!guild) return res.status(404);
  logger.debug(`WebDash called RESET_SETTINGS action on guild ${guild.name}.`);
  if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect("/");
  logger.debug(`WebDash executed RESET for ${guild.name} settings!`);
  try {
    await client.settings.guild.delete(guild);  
    await client.settings.guild.init([guild.id]);
    req.flash("success", "Settings Reset Complete!");
    res.redirect(`/dashboard/${req.params.guildID}`);
  } catch (error) {
    logger.error(error.message); logger.debug(error.stack);
    req.flash("danger", "Error occured while resetting server settings! Redirected automatically to main dashboard page.");
    res.redirect('/dashboard');
  };
});
router.get('/:guildID/kick/:userID', checkAuth, async (req, res) => {
  const client = res.locals.client;
  const guild = client.guilds.cache.get(req.params.guildID);
  const member = guild.members.cache.get(req.params.userID);
  if (!guild) return res.status(404);
  logger.debug(`WebDash called USER_KICK action on user ${member.user.id} in guild ${guild.name}.`);
  if (!isManaged(guild, req.user) && !req.session.isAdmin) res.redirect('/');
  if (req.params.userID === client.user.id || req.params.userID === req.user.id) {
    req.flash('warning', `Unable to kick ${member.user.tag}. Either insufficient permissions, an error occured or action was rejected by system.`);
    logger.warn(`WebDash Operator BAN ${member.user.tag} aborted by DashService!`);
    logger.warn(`Reason: The requested MemberID of ${member.user.tag}was the User's or Bot's unique ID.`);
  } else {
    member.kick(`Kicked by WebDash Operator (ID :${req.user.id})`)
      .then(req.flash('success', `${member.user.tag} has been removed from ${guild.name} successfully!`))
      .catch(err => {
        req.flash('danger', `Could not kick ${member.user.tag} due to missing permissions or another error occured.`);
        logger.warn(`WebDash Operator KICK ${member.user.tag} failed.`);
        logger.error(err); logger.debug(err.stack);
      });
  }
  res.redirect(`/dashboard/${req.params.guildID}/members`);
});
router.get('/:guildID/ban/:userID', checkAuth, async (req, res) => {
  const client = res.locals.client;
  const guild = client.guilds.cache.get(req.params.guildID);
  const member = guild.members.cache.get(req.params.userID);
  if (!guild) return res.status(404);
  logger.dash(`WebDash called USER_BAN action on user ${member.user.id} in guild ${guild.name}.`);
  const isManaged = member.permissions.has('MANAGE_GUILD');
  if (!isManaged && !req.session.isAdmin) res.redirect('/');
  if (req.params.userID === client.user.id || req.params.userID === req.user.id) {
    req.flash('warning', `Unable to kick ${member.user.tag}. Either insufficient permissions, an error occured or action was rejected by system.`);
    logger.warn(`WebDash Operator BAN ${member.user.tag} aborted by DashService!`);
    logger.warn(`Reason: The requested MemberID of ${member.user.tag}was the User's or Bot's unique ID.`);
  } else {
    member.ban({ days: 7, reason: `Banned by Dashboard Operator (ID: ${req.user.id})` })
      .then(req.flash('success', `Banned ${member.user.tag} Successfully!`))
      .catch(err => {
        req.flash('danger', `Could not ban ${member.user.tag} due to missing permissions or another error occured.`);
        logger.warn(`WebDash Operator BAN ${member.user.tag} failed.`);
        logger.error(err); logger.debug(err.stack);
      });
    req.flash('success', `Removed from ${guild.name} successfully!`);
  }
  res.redirect(`/dashboard/${req.params.guildID}/members`);
});

module.exports = router;