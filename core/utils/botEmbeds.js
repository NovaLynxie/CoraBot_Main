const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');

function systemEmbed(state, params) {
  const embed = new MessageEmbed(baseEmbed);
  const { response, error } = params;
  let generalDetails = {}, errorDetails = {};
  if (response) {
    // generic system response message (unused?)
    generalDetails = {
      name: 'System Response',
      value: stripIndents`
        \`\`\`${(typeof response === 'object') ? JSON.stringify(response, null, 2) : response)
    }\`\`\`
      `
  };
};
if (error) {
  // display error data here (for debugging)
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
      .setTitle('Error!')
      .setColor('#de481b')
      .addFields(errorDetails);
    break;
  default:
    embed
      .setTitle('Unknown State!')
};
return embed;
};
function welcomeEmbed() {
  const template = require('../assets/json/welcomeEmbed.json');
  const embed = new MessageEmbed(template);
  
  return embed;
};

module.exports = systemEmbed;
module.exports.embeds = { system: systemEmbed, welcome: welcomeEmbed };