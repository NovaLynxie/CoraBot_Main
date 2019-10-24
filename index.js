// Loads required modules into the code.
const Discord = require("discord.js");
// Links code to other required parts.
const fs = require('fs');
// Read information from files (core bot)
const Client = require('./cora_modules/cora.data/client.js');
const {
	prefix,
	token,
} = require('./config.json');

// Variables for DiscordBot
const bot = new Client(); //Custom discord client.js replaces Discord.Client()
bot.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

// Command files handler to parse <cmd>.js files.
const cmdsDir = './cora_modules/cora.cmds'
const cmdFiles = fs.readdirSync(cmdsDir).filter(file => file.endsWith('.js'));
console.log("Grabbing cmdFiles from `"+cmdsDir+"`...")
console.log("Fetching commands from cmdFiles and storing into table...")
for (const file of cmdFiles) {
  const cmds = require(`./cora_modules/cora.cmds/${file}`)
  bot.commands.set(cmds.name, cmds)
  //console.log("Added "+file) //Debug console printout to confirm data.
}
//console.log(bot.commands); //Debug console prompt to print all commands
console.log("Commands table generated! Starting CoraBot...")

// Bot.on Runtime
bot.on('ready', () => {
  bot.user.setStatus('online')
  bot.user.setActivity("the guild", {type:'Watching'});
  console.log("CoraBot is Online!")
})
bot.once('reconnecting', () => { 
  console.log('L.O.S! Attempting to reconnect...')
})
bot.once('disconnect', () => {
  console.log('Bot disconnected from Discord!')
})

// Process Error Handler - Catches any errors and attempt to prevent a bot crash.
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

// Bot Command Handler (Requires Command Files)
bot.on('message', async message => {
  // If message is not a command, ignore the message.
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  // Parses args from command into args object.
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmdName = args.shift().toLowerCase();
  const command = bot.commands.get(cmdName)
    || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
  
  // Checks if command is set as guildOnly command.
  if (command.guildOnly && message.channel.type !== 'text')
    return message.reply('I can\'t execute that command inside DMs!');
  
  // Checks if message is from the bot and ignores it.
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  // Checks for command cooldowns, if it has sets the cooldowns.
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }
  
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
  
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  
  try {
    command.execute(message, bot, token);
  } 
  catch (error) {
    console.error(error);
    message.reply('Handler Error!')
  }
});

bot.login(token); 
//Required to get bot token to interact with discord bot account.