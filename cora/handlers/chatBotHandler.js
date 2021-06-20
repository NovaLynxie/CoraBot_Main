const ChatBot = require('discord-chatbot');
const chatbot = new ChatBot({name: "Cora", gender: "Female"});

module.exports = (message, client) => {
  let chatBotSettings = client.settings.get('chatbot', { enableChatBot: false});
  let {enableChatBot, chatChannels} = chatBotSettings;
  if (enableChatBot) {
    chatChannels.forEach(chatChannel => {
      if (chatChannel === message.channel.id) {
        chatbot.chat(message).then(res => {
          message.channel.send(res);
        })
      }
    })
  }
}

