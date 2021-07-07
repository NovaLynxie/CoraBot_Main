const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const fetch = require('node-fetch'); // used for parsing json response.
const { stripIndents } = require('common-tags');
const {tokens} = require('../../handlers/bootLoader');
const {cheweyApiToken} = tokens; // my unique api token.
const authHeader = `?auth=${cheweyApiToken}`; // auth parameter.
const apiUrl = `https://api.chewey-bot.top/`; // cheweybot api domain.

module.exports = class AnimalsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'animal',
            group: 'image',
            memberName: 'animal',
            description: 'Some fun furry images using CheweyBotAPI.',
            details: stripIndents`
                This command provides a bunch of cute and adorable animal images.
                From our feathered birds, cute bleps, to the wild animals such as foxes and wolves. 
                Service provided by CheweyBotAPI, please **do not** abuse this command.`,
            examples: ['animal <option>'],
            throttling: {
                usages: 1,
                duration: 3
            },
            args: [
                {
                    key: 'option',
                    prompt: 'animal.command.prompt.option',
                    default: '',
                    type: 'string'
                }
            ]
        });
    }
    async run(message, args) {
        const { option } = args;
        // Embed Function Handler to format output of furry image command.
        function imgEmbed (client, url) {
            const imageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Animal Handler v2')
                .setImage(url)
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', client.user.displayAvatarURL({ format: 'png'}))
            return message.channel.send(imageEmbed); // Sends the image embed to the channel the user ran the command.
        }
        // Status Check Function
        function checkStatus(res) {
          if (res.ok) { // res.status >= 200 && res.status < 300
            return res;
          } else {
            logger.error('Connection Error! See status response below.')
            logger.error(`${res.status} ${res.statusText}`);
            message.reply('unable to fetch image from CheweyBotAPI! Please contact my owner for help as this should not happen!')
          }
        }

        // animal command option handler.
        if (option === 'help') {
          const helpEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('You confused? Here ya go!')
            .setDescription(stripIndents`
                Here are the subcommands for the \`animal\` command.
            `)
            .addField(
                'Animal Options',
                '\`birb, cat, dog, duck, fox, koala, otter, owl, panda, rabbit, red-panda, snake, turtle, wolf\`'
            )
            .setThumbnail(this.client.user.avatarURL({format:"png"}))
            .setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', this.client.user.avatarURL({format:"png"}))
          return message.channel.send(helpEmbed);
        } if (option === 'bird' || option === 'birb') {
          logger.debug(`opthandler -> option=${option}`)
          logger.debug(apiUrl+'birb'+authHeader);
          fetch(apiUrl+'birb'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data);
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'cat') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'cat'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data);
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'dog') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'dog'+authHeader)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'duck') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'duck'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'fox') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'fox'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'koala') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'koala'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'otter') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'otter'+authHeader)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'owl') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'owl'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'panda') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'panda'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            });
          return;
        } if (option === 'rabbit') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'rabbit'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            });
          return;
        } if (option === 'redpanda') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'red-panda'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            })
          return;
        } if (option === 'snake') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'snake'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'turtle') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'turtle'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } if (option === 'wolf') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'wolf'+authHeader)
            .then(checkStatus)
            .then(res=>res.json())
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data)
            }).catch(err => {
              logger.error('Error occured while fetching/parsing data!');
              logger.error(err); logger.debug(err.stack);
            });
          return;
        } else {
          message.reply(stripIndents`
          I'm sorry, but that option does not exist.
          Please check your command input and try again.
          *Use \`<prefix> help animal\` for help with this command.*`)
        }
    }
};