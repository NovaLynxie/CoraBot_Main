const logger =  require('./winstonLogger');
const ChatBot = require('discord-chatbot');

module.exports = async (message, client) => {
  let settings = await client.settings.guild.get(message.guild);
  let { enableChatBot, chatBotOpts, chatChannels } = settings.chatBot;
  let { botName, botGender } = chatBotOpts;
  let chatBotModule = new ChatBot({
    name: (botName) ? botName : 'Udit',
    gender: (botGender) ? botGender : 'Male'
  });
  logger.verbose('chatbot.trigger.event');
  logger.verbose(`message=${message}`); logger.verbose(`enableChatBot=${enableChatBot}`);
  function chatBotResponder(channel) {
    if (channel === message.channel.id) {
      chatBotModule.chat(message).then(res => {
        logger.debug(`sending message '${res}' to channel ${message.channel.name}`);
        message.channel.send(res);
      });
    } else {
      logger.debug('Channel IDs do not match! Silently ignoring message.');
    };
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