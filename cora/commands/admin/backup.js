const { Command } = require('discord.js-commando');
const fs = require('fs');
const moment = require('moment');
//const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');
module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'backup',
      group: 'admin',
      memberName: 'backup',
      aliases: ['save'],
      description: 'Tries to save messages from a channel.',
      details: 'Tries to collect messages from a channel and save them locally into a text file.',
      examples: ['backup <channel_id>'],
      clientPermissions: ['VIEW_CHANNEL'],
      userPermissions: ['READ_MESSAGE_HISTORY'],
      guildOnly: true,
      ownerOnly: true,
      throttling: {
          usages: 1,
          duration: 5,
      },
      args: [
          {
              key: 'chID',
              prompt: 'Which channel would you like to save messages from?',
              type: 'string'
          }
      ]
    })
  }
  run(message, { chID }) {
    var channel = this.client.channels.cache.get(chID);
    var dirpath = './data/transcripts'
    var filepath = `${dirpath}/channel-${chID}.txt`
    fs.mkdir(dirpath, {recursive: true},(err) => {
      if (err) {
        if (err.code === "EEXIST") {
          logger.debug('Directory already exists! Skipping mkdir attempt.')
          return;
        }
        logger.error(err);
      }
    })
    channel.messages.fetch({ limit: 100 }).then(messages => {
      logger.data(`Received ${messages.size} messages`);
      logger.debug(`TypeOf 'messages' ${messages}`);
      //Iterate through the messages here with the variable "messages".
      let dateOb = new Date()
      let stream = fs.createWriteStream(filepath, {flags:'a'});
      logger.info(`Writing messages from channel ${channel.name} into local file...`)
      stream.write(stripIndents`
        ${dateOb.toDateString()} ${dateOb.toTimeString()}\r\n
        ------------------------------------------------------------\r\n

      `);
      //messages.reverse(); // Make sure messages are oldest to newest.
      let index = 1, total = messages.size;
      messages.forEach(message => {
        logger.data(`Writing message ${index}/${total}...`)
        stream.write(stripIndents` 
          ----------------------------------------\n
          Username:${message.author.username}#${message.author.discriminator}
          User ID:${message.author.id} \n
          First Created: ${(message.createdAt !== null) ? message.createdAt : 'N/A'} \n
          Last Edited: ${(message.editedAt !== null) ? message.editedAt : 'N/A'} \n
          ${message.content} \n
          ----------------------------------------\n
        `)
        index++;
      })
      stream.write('\r\n End of messages.')
      logger.info(`Finished writing ${total} messages to file!`)
    })
  };
};