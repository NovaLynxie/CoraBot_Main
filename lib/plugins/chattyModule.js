const logger = require('../utils/winstonLogger.js');
const ChatBot = require('discord-chatbot');

module.exports = async (message, client) => {
  if (!client.modules.enableChatBot) return;
  let settings = await client.settings.guild.get(message.guild);
  let { enableChatBot, chatBotOpts, chatChannels } = settings.chatBot;
  let { botName, botGender } = chatBotOpts;
  let chatBotModule = new ChatBot({
    name: (botName) ? botName : 'Udit',
    gender: (botGender) ? botGender : 'Male'
  });
  logger.verbose('chatbot.trigger.event');
  logger.verbose(`message=${message}`); logger.verbose(`enableChatBot=${enableChatBot}`);
  function chatBotResponder(channelId) {
    if (channelId === message.channel.id) {
      chatBotModule.chat(message.content).then(res => {
        logger.debug(`sending message '${res}' to channel ${message.channel.name}`);
        message.channel.send(res);
      });
    } else {
      logger.debug('Channel IDs do not match! Silently ignoring message.');
    };
  };
  try {
    if (enableChatBot) {
      chatChannels.forEach(chatChannel => {
        logger.debug(`searching for channel with ID ${chatChannel}`)
        chatBotResponder(chatChannel);
      });
    };
  } catch (err) {
    logger.warn('ChatBot.handler encountered an error!');
    logger.error(err.message); logger.debug(err.stack);
  };
};