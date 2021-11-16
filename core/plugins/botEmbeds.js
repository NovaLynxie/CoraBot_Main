const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');

function dynamicSystemEmbeds(state, params, client) {
  const embed = new MessageEmbed(baseEmbed);
  const { data, error } = params;
  let generalDetails = {}, errorDetails = {};
  if (data) {
    // unsure what will be displayed here yet...
    generalDetails = {
      name: 'placeholderText',
      value: stripIndents`
        placeholderText
      `
    };
  };
  if (error) {
    // display error data here (helps for debugging)
    errorDetails = {
      name: 'Error Data',
      value: stripIndents`
        \`\`\`
        ${JSON.stringify(error, null, 2)}
        \`\`\`
      `
    }
  };
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