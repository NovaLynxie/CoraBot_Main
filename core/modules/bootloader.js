const toml = require('toml');
const fs = require('fs');

// Generates data and storage directories.
fs.mkdir('./data/storage', {recursive: true}, (err) => {
  if (err) {
      return console.error(err);
  }
  console.log('./data/storage generated');
});
// Generates bot settings directory.
fs.mkdir('./settings', (err) => {
  if (err) {
    if (err.code === 'EEXIST') return;
    else return console.error(err);
  }
  console.log('./settings generated');
});

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

var {discordToken, ytApiKey} = authCfgData;
if (!discordToken) discordToken = process.env.DISCORD_TOKEN;

const {general} = mainCfgData;
var {globalPrefix, ownerIDs} = general;

module.exports.credentials = {discordToken, ytApiKey};
module.exports.config = {globalPrefix, ownerIDs};