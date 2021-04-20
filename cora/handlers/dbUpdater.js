const logger = require('../providers/WinstonPlugin');
const Database = require("@replit/database");
const db = new Database();

module.exports = async function updateDB(client) {
  let botUptime = (client.uptime / 1000);
  let totalGuilds = client.guilds.cache.size;
  let totalMembers = client.users.cache.size;
  let allChannels = client.channels.cache.filter(ch=>ch.type!=='category').size;
  let voiceChannels = client.channels.cache.filter(ch=>ch.type==='voice').size;
  let textChannels = client.channels.cache.filter(ch=>ch.type==='text').size;
  // uptime parser
  let days = Math.floor(botUptime / 86400);
  botUptime %= 86400;
  let hours = Math.floor(botUptime / 3600);
  botUptime %= 3600;
  let minutes = Math.floor(botUptime / 60);
  //let seconds = Math.floor(botUptime % 60);
  let totalUptime = `${days}d ${hours}h ${minutes}m`;
  // repldb updater
  logger.verbose('ran task update_database')
  logger.verbose(`assigning uptime as ${totalUptime}`);
  await db.set("uptime", totalUptime);
  logger.verbose(`assigning guilds as ${totalGuilds}`);
  await db.set("guilds", totalGuilds);
  logger.verbose(`assigning channels as ${allChannels}`);
  await db.set("allChannels", allChannels);
  logger.verbose(`assigning users as ${totalMembers}`);
  await db.set("members", totalMembers);
  logger.verbose(`assigning channels as ${voiceChannels}`);
  await db.set("voiceChannels", voiceChannels);
  logger.verbose(`assigning channels as ${textChannels}`);
  await db.set("textChannels", textChannels);
  //logger.debug('completed successfully!');
}