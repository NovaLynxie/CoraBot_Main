const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');

function systemEmbed(state, params) {
  const embed = new MessageEmbed(baseEmbed);
  const { data, error } = params;
  let generalDetails = {}, errorDetails = {};
  if (data) {
    // unsure what will be displayed here yet...
    generalDetails = {
      name: 'System Response',
      value: stripIndents`
        ${data.message}
      `
    };
  };
  if (error) {
    // display error data here (helps for debugging)
    errorDetails = {
      name: 'Error Data',
      value: stripIndents`
        \`\`\`
        ${error.message}
        ${error.stack}
        \`\`\`
      `
    }
  };
  switch (state) {
    case 'success':
      embed
        .setTitle('Success!')
        .setColor('#42f595')
        .addFields(generalDetails);
      break;
    case 'info':
      embed
        .setTitle('Information')
        .setColor('#1bdeb0')
        .addFields(generalDetails);
      break;
    case 'warn':
      embed
        .setTitle('Warning!')
        .setColor('#de7c1b')
        .addFields(generalDetails);
      break;
    case 'error':
      embed
        .setTitle('Error Occured!')
        .setColor('#de481b')
        .addFields(generalDetails, errorDetails);
      break;
    default:
      embed
        .setTitle('Unknown State!')
  };
  return embed;
};

module.exports = systemEmbed;