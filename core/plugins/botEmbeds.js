const { MessageEmbed } = require('discord.js');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');

function dynamicSystemEmbeds(state, params, client) {
  const embed = new MessageEmbed(baseEmbed);
  let details;
  switch (state) {
    case 'success':
      embed.setColor('#42f595');
      break;
    case 'info':
      embed.setColor('#1bdeb0');
      break;
    case 'warn':
      embed.setColor('#de7c1b');
      break;
    case 'error':
      embed.setColor('#de481b');
      break;
    case 'fatal':
      embed.setColor('#de2e1b');
      break;
    default:
      // ..
  };
  return embed;
};

module.exports = { system: dynamicSystemEmbeds };