const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');

function systemEmbed(state, params) {
  const embed = new MessageEmbed(baseEmbed);
  const { error, response, title } = params;
  let generalDetails, errorDetails;
  if (response) {
    generalDetails = stripIndents`
    \`\`\`${(typeof response === 'object') ? JSON.stringify(response, null, 2) : response}\`\`\`
    `;
  };
  if (error) {
    errorDetails = stripIndents`
    \`\`\`
    ${error.message}
    ${error.stack}
    \`\`\`
    `;
  };
  switch (state) {
    case 'success':
      embed
        .setTitle('Success!')
        .setColor('#42f595')
        .setDescription(generalDetails);
      break;
    case 'info':
      embed
        .setTitle('Information')
        .setColor('#1bdeb0')
        .setDescription(generalDetails);
      break;
    case 'warn':
      embed
        .setTitle('Warning!')
        .setColor('#de7c1b')
        .setDescription(generalDetails);
      break;
    case 'error':
      embed
        .setTitle((title) ? title : 'Generic Error!')
        .setColor('#de481b')
        .setDescription(errorDetails);
      break;
    default:
      logger.error('Unknown or unrecognised state called!');
      embed
        .setTitle('Unknown State!')
        .setDescription('Unknown or unrecognised state called!');
  };
  return embed;
};
function genericEmbed(params = {}) {
  const {/* add parameters here! */ } = params;
  /* 
   * process parameter data here before passing to switch statement.
   */
  let something = ''; // temporary placeholder;
  switch (something) {
    case 'INSERT_VALUE_HERE':
      break;
    default:
      logger.debug('Unknown Response Type');
  };
  return embed;
};
module.exports.embeds = {
  generic: genericEmbed,
  system: systemEmbed
};