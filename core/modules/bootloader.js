const toml = require('toml');
const fs = require('fs');

let authCfgData, mainCfgData;
try {
  authCfgData = toml.parse(fs.readFileSync('./settings/auth.toml', 'utf-8'));
} catch (err) {
  console.error('Failed to load auth.toml configuration!');
  console.error(err.message); console.debug(err.stack);
  console.warn('Falling back to environment variables.');
}
try {
  mainCfgData = toml.parse(fs.readFileSync('./settings/main.toml', 'utf-8'));
} catch (err) {
  console.error('Failed to load main.toml configuration!');
  console.error(err.message); console.debug(err.stack);
  console.warn('Cannot proceed with bot boot up.')
}

var {discord} = authCfgData;
var {discordToken, ytApiKey} = discord;
if (!discordToken || discordToken === 'NOT_SET') {
  discordToken = process.env.DISCORD_TOKEN;
}

const {general} = mainCfgData;
var {globalPrefix, ownerIDs} = general;

module.exports.credentials = {discordToken, ytApiKey};
module.exports.config = {globalPrefix, ownerIDs};