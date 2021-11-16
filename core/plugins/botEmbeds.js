const { MessageEmbed } = require('discord.js');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');

function dynamicSystemEmbeds(state, params, client) {
  const embed = new MessageEmbed(baseEmbed);
  let details;
  switch (state) {    
    case 'success':
      break;
    case 'info':
      break;
    case 'warn':
      break;
    case 'error':
      break;
    case 'fatal':
      break;
    default;
  };
  return embed;
};