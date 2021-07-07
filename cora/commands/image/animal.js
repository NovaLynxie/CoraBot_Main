const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');
const {cheweyApiToken} = process.env; // my unique api token.
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
        let guild = message.guild;
        // Embed Function Handler to format output of furry image command.
        function imgEmbed (client, url) {
            const imageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Animal Handler v2')
                .setImage(url)
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', client.user.displayAvatarURL({ format: 'png'}))
            return message.channel.send(imageEmbed); // Sends the image embed to the channel the user ran the command.
        }
        // animal command option handler. (MAY REWRITE OPTION CALLS IF API MODULE IS CHANGED!)
        if (option === 'help') {
          const helpEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('You confused? Here ya go!')
            .setDescription(stripIndents`
                Here are the subcommands for the \`animal\` command.
            `)
            .addField(
                {name:'Animal Options', value:'\`birb, cat, dog, duck, fox, koala, otter, owl, panda, rabbit, red-panda, snake, turtle, wolf\`'}
            )
            .setThumbnail(this.client.user.avatarURL({format:"png"}))
            .setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', this.client.user.avatarURL({format:"png"}))
          return message.channel.send(helpEmbed);
        } if (option === 'bird' || option === 'birb') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'birb'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type);
            });
          return;
        } if (option === 'cat') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'cat'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type);
            });
          return;
        } if (option === 'dog') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'dog'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'duck') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'duck'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'fox') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'fox'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'koala') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'koala'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'otter') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'otter'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'owl') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'owl'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'panda') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'panda'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'rabbit') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'rabbit'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'redpanda') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'red-panda'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'snake') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'snake'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'turtle') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'turtle'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } if (option === 'wolf') {
          logger.debug(`opthandler -> option=${option}`)
          fetch(apiUrl+'wolf'+authHeader)
            .then(res=>{
              logger.debug('recieving data from cheweybot api...');
              logger.data(res);
              logger.debug("parsing data as json object");
              res.json();
            })
            .then(json=>{
              logger.debug('verifying json object data');
              logger.data(json);
              imgEmbed(this.client, json.data, json.type)
            });
          return;
        } else {
          message.reply(stripIndents`
          I'm sorry, but that option does not exist.
          Please check your command input and try again.
          *Use \`${(guild.commandPrefix) ? guild.commandPrefix : client.commandPrefix} help animal\` for help with this command.*`)
        }
    }
};