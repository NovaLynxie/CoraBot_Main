const { stripIndents } = require('common-tags');
const { formatDistance } = require('date-fns');
const { version } = require('../../../package.json');
const logger = require('../../plugins/winstonLogger');
const { renderView } = require('../dashutil');

const express = require('express');
const router = express.Router();

// Dashboard Routes - Public and Authenticated site endpoints.
// Regular Information Pages (public pages)
app.get('/', (req, res) => {
  renderView(res, req, 'index.pug');
});
app.get("/commands", async (req, res) => {
  const appcmds = await client.application.commands.fetch();
  logger.verbose(JSON.stringify(appcmds));
  let allcmds = [];
  appcmds.forEach(cmd => {
    logger.verbose(`options: ${JSON.stringify(cmd.options)}`);
    logger.verbose('Generating command object for displaying data...');
    let obj = {
      name: cmd.name[0].toUpperCase() + cmd.name.substring(1),
      description: cmd.description,
      options: cmd.options.map(option => {
        return {
          name: option.name[0].toUpperCase() + option.name.substring(1),
          type: option.type,
          description: option.description,
          required: (option.required) ? 'Yes' : 'No'
        };
      })
    };
    logger.verbose(`command: ${JSON.stringify(obj)}`);
    allcmds.push(obj);
  });
  renderView(res, req, "cmds.pug", {
    all_commands: allcmds
  });
});
app.get('/stats', (req, res) => {
  const duration = formatDistance(new Date(0), new Date(client.uptime)) || '...';
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

module.exports = router;