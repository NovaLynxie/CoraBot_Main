// Loads required modules into the code.
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const Flatted = require("flatted");
// Links code to other required parts.
const fs = require('fs');
// Read information from files (core bot)
const Client = require('./cora_modules/cora.data/client.js');
const {
	prefix,
	token,
} = require('./config.json');

// Variables for DiscordBot
//const bot = new Discord.Client();
const bot = new Client(); //Custom discord client.js replaces Discord.Client()
bot.commands = new Discord.Collection();
const queue = new Map();

// Command files handler to parse <cmd>.js files.
const cmdsDir = './cora_modules/cora.cmds'
const cmdFiles = fs.readdirSync(cmdsDir).filter(file => file.endsWith('.js'));
console.log("Grabbing cmdFiles from `"+cmdsDir+"`...")
console.log("Fetching commands from cmdFiles and storing into table...")
for (const file of cmdFiles) {
  const cmds = require(`./cora_modules/cora.cmds/${file}`)
  bot.commands.set(cmds.name, cmds)
  console.log("Added "+file) //Debug console printout to confirm data.
}
//console.log(bot.commands); //Debug console prompt to print all commands
console.log("Commands table generated! Starting CoraBot...")

// Bot.on Runtime
bot.on('ready', () => {
  bot.user.setStatus('online')
  bot.user.setActivity("with beta code o.O", {type:'PLAYING'});
  console.log("CoraBot Beta ONLINE!")
  console.log("WARNING! Running BETA core code! Some features may be incomplete!")
})
bot.once('reconnecting', () => { 
  console.log('L.O.S! Attempting to reconnect...')
})
bot.once('disconnect', () => {
  console.log('Bot disconnected from Discord!')
})

// Bot Command Handler (Requires Command Files)
bot.on('message', async message => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmdName = args.shift().toLowerCase();
  const command = bot.commands.get(cmdName)
    || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  try {
    command.execute(message, bot, token);
  } 
  catch (error) {
    console.error(error);
    message.reply('Invalid command!')
  }
});

bot.login(token); 
//Required to get bot token to interact with discord bot account.