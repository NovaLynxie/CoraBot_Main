const express = require('express');
const Discord = require('discord.js');
const router = express.Router();
const dashUtils = require('../dashutils.js');
const {checkAuth, renderView} = dashUtils;

router.get("/dashboard", checkAuth, (req, res) => {
  const perms = Discord.EvaluatedPermissions;
  renderView(res, req, "dash.pug", {perms});
});

router.post("/dashboard/:guildID/manage", checkAuth, (req, res) => {
  const guild = client.guilds.get(req.params.guildID);
  if (!guild) return res.status(404);
  const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
  if (!isManaged && !req.session.isAdmin) res.redirect("/");
  client.writeSettings(guild.id, req.body);
  res.redirect("/dashboard/"+req.params.guildID+"/manage");
});

module.exports = router;