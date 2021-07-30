const ChatBot = require('discord-chatbot');
const logger =  require('../providers/WinstonPlugin');

module.exports = (message, client) => {
  let chatBotSettings = message.guild.settings.get('chatbot', { enableChatBot: false});  
  let {enableChatBot, chatBotUser, chatChannels} = chatBotSettings;
  let {botName, botGender} = chatBotUser;
  let chatBotModule = new ChatBot({
    name: (botName) ? botName : 'Cora',
    gender: (botGender) ? botGender : 'Female'
  });

  logger.verbose('chatbot.trigger.event');
  logger.verbose(`message=${message}`); logger.verbose(`enableChatBot=${enableChatBot}`);

  function chatBotResponder(channel) {
    if (channel === message.channel.id) {
      chatBotModule.chat(message).then(res => {
        logger.debug(`sending message '${res}' to channel ${message.channel.name}`);
        message.channel.send(res);
      })
    } else {
      logger.debug('Channel IDs do not match! Silently ignoring message.');
    }
  };
  try {
    if (enableChatBot) {
      logger.debug('chatbot responding...')
      if (typeof chatChannels === 'string') {
        chatBotResponder(chatChannels);
      } else {
        chatChannels.forEach(chatChannel => {
          logger.debug(`searching for channel with ID ${chatChannel}`)
          chatBotResponder(chatChannel);
        });
      };
    };
  } catch (err) {
    logger.warn('ChatBot.handler encountered an error!');
    logger.error(err.message); logger.debug(err.stack);
  };
};