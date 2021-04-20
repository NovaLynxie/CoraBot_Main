const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const getLocalTime = require('../../handlers/serverRegion');
module.exports = class RegisterCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'register',
            aliases: ['signup'],
            group: 'admin',
            memberName: 'register',
            description: 'Registers user to gain access to certain content.',
            details: `Adds user to registered users which would allow access to restricted content hidden from the other users.`,
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            }
        });
    }
    async run(message) {
        //Defines variables and constants to be used.
        const messages = [];
        const guildID = message.guild.id
        const whitelist = serverIDs
        const isWhitelisted = checkWhitelist(whitelist, guildID);
        var channel = message.guild.channels.cache.find(ch => ch.name === 'registrations')
        var logDate = getLocalTime(message);
        //var nickname = null;
        var dmsOpen = null;
        var age = null;
        var gender = null;
        var desc = null;
        var blockProcess = 0;
        let serverName = message.guild.name;
        let roleRegistered = message.guild.roles.cache.find(muterole => muterole.name === "Muted")
        if (!roleRegistered) {
            try {
                console.log(`[Warn] Role 'Registered' not found in ${serverName}! Generating one now.`)
                console.log(`[Info] Generating role 'Registered' in ${serverName}.`)
                muterole = await message.guild.createRole({
                    name: "Registered",
                    color: 0x000000,
                    permissions:[]
                })
                console.log(`[Info] Setting channel perms for role "Muted" in ${serverName}.`)
                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                    console.log(`[Info] Settings applied to channels in ${serverName}.`)
                });
                console.log(`[Info] Role generation completed successfully!`)
            } catch (err) {
                console.log(`[Error] Unable to create a new role named 'Registered'! Possibly missing permissions`)
                console.log(err.stack);
                console.log(`[Warn] Cannot properly register user without a 'Registered' role in the server.`)
            }
        }
        try {
            // Start of Register in Guild            
            if (message.channel.type !== 'dm') {
                console.log(`[Zeon] Opening private channel to ${message.author.username}#${message.author.discriminator}'s DM`)
                await message.reply(stripIndents`
                I have sent you a DM with futher instructions. Please read the instructions very carefully.
                Any answers that are found to be incorrect or dishonest will result in your account being penalized and/or banned.`)
            }            
           // Start of Register in DMs.
            if (blockProcess === 0) {
                await message.author.send(`Are you ok with chatting openly in dm's to other members?`)
                await message.author.dmChannel.awaitMessages(resolve => {
                    if (!resolve.author.bot) {
                        dmsOpen = resolve.content;
                        return blockProcess = 1;
                    }
                }, { max: 1, time: 30000, errors: ['time'], })
                .catch(() => {
                    message.direct('Registration timed out, sorry. Please run the command again.')
                });
            }
            if (blockProcess === 1) {
                await message.author.send(stripIndents`
                What is your gender? 
                (Male/Female/Genderfluid/Agender/Non-binary/Transgender/Prefer not to say)`)
                await message.author.dmChannel.awaitMessages(resolve => {
                    if (!resolve.author.bot) {
                        gender = resolve.content;
                        return blockProcess = 2;
                    }
                }, { max: 1, time: 30000, errors: ['time'], })
                .catch(() => {
                    message.direct(`Registration timed out, sorry. Please run the command again.`)
                })
            }
            if (blockProcess === 2) {
                await message.author.send(stripIndents`
                How old are you? **This is required to verify access to restricted content!**
                Lying about your age will get your account **banned or penalized** if you are found to be underage!`)
                await message.author.dmChannel.awaitMessages(resolve => {
                    if (!resolve.author.bot) {
                        age = resolve.content;
                        return blockProcess = 3;
                    }
                }, { max: 1, time: 30000, errors: ['time'], })
                .catch(() => {
                    message.author.send(`Registration timed out, sorry. Please run the command again.`)
                })
            }
            if (blockProcess === 3) {
                await message.author.send(stripIndents`
                Tell us about yourself! Please keep it as brief as possible.`)
                await message.author.dmChannel.awaitMessages(resolve => {
                    if (!resolve.author.bot) {
                        desc = resolve.content;
                        return blockProcess = 4;
                    }
                }, { max: 1, time: 30000, errors: ['time'], })
                .catch(() => {
                    message.author.send(`Registration timed out, sorry. Please run the command again.`)
                })
            }
            if (blockProcess === 4) {
                console.log(`[Zeon] Registration data collected, processing information.`)
                // Logs registration to channel and completes registration.
                if (!channel) {
                    message.say(stripIndents`
                    Whoops! 🙀
                    I'm missing a registrations channel or cannot find it, unable to save your registration!
                    Please contact my owner or higher ups immediately as I cannot log registrations without one!
                    `)
                    console.log('[Error] Missing channel or permissions invalid! Unable to log registration!')
                    console.log('[Error] Registration was not saved and has been discarded.')
                    return
                }
                const username = message.author.name+'#'+message.author.discriminator;
                const nickname = ''
                dmsOpen = dmsOpen.charAt(0).toUpperCase()+dmsOpen.slice(1);
                console.log(`[Zeon] Generating Embed from information gathered from user...`)
                const registerEmbed = new MessageEmbed()
                    .setTitle('Registration Log')
                    .setDescription('> User Registry Info')
                    .addFields(
                        {
                            name: `> Member's Information`,
                            value: stripIndents`
                                    - Name: ${username}
                                    - Nick: ${nickname}
                                    - Age: ${age}
                                    - Gender: ${gender}
                                    - DMs Open? ${dmsOpen}
                            `
                        },
                        {
                            name: `> Registration Details`,
                            value: stripIndents`
                            Registered on ${logDate}`
                        },
                        {
                            name: `> Describe yourself`,
                            value: stripIndents`
                                    ${desc}
                            `
                        }
                    )
                    .setThumbnail(message.author.displayAvatarURL({format:'png'}))
                    .setFooter(`Registration logged on ${logDate} by Cora`)
                channel.send(registerEmbed);
                await message.direct(`Thank you for registering with us. Have a great day!`)
            }
        } catch (error) {
            message.say(stripIndents`
            An error occured while I was processing your registration request.
            Check \`Allow direct messages from server members\` is enabled for this server and try again.
            If you are still receiving this error, contact my owner or higher ups immediately.
            `)
            console.log(`[Error] Error while accessing user's dms or processing information`)
            console.log(`[Warn] User may have disabled DMs for ${message.guild.name} server.`)
            console.error(error)
        }
        return messages;
    }
};