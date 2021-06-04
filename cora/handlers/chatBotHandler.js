const {chatty} = require('../handlers/bootLoader.js');
const ChatBot = require('discord-chatbot');
const chatbot = new ChatBot({name: "Cora", gender: "Female"});
const {enableChatBot, chatChannels} = chatty;

module.exports = (message, client) => {
  let chatBotSettings = client.settings.get('chatbot');
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

