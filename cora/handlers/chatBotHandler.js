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
  if (enableChatBot) {
    logger.debug('chatbot responding...')
    chatChannels.forEach(chatChannel => {
      logger.debug(`searching for channel with ID ${chatChannel}`)
      if (chatChannel === message.channel.id) {
        chatBotModule.chat(message).then(res => {
          logger.debug(`sending message (${res}) to channel ${message.channel.name}`)
          message.channel.send(res);
        })
      }
    })
  }
}

