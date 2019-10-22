// Loads required modules into the code.
const Discord = require("discord.js")
const YTDL = require("ytdl-core")
const Flatted = require("flatted")
// Links code to other required parts.
const fs = require('fs')
// Read information from files (core bot)
const Client = require('./cora_modules/cora.data/client.js')
const {
	prefix,
	token,
} = require('./config.json');
const {
  version,
} = require('./package.json');

// Variables for DiscordBot
//const bot = new Discord.Client();
const bot = new Client(); //Custom discord client.js replaces Discord.Client()
const queue = new Map();

// Command files handler to parse <cmd>.js files.
const cmdFiles = fs.readdirSync(`./cora_modules/cora.cmds`).filter(file => file.endsWith('.js'));
console.log("Grabbing cmdFiles")
for (const file of cmdFiles) {
  const cmds = require(`./cora_modules/cora.cmds/${file}`)
  bot.commands.set(cmds.name, cmds)
}

// Bot.on Runtime
bot.on('ready', () => {
  bot.user.setStatus('online')
  bot.user.setActivity("with my code x3", {type:'PLAYING'});
  console.log("CoraBot ONLINE!")
})

// Bot Command Handler
bot.on('message', async message => {
  if (message.author.bot) return;
  //if (!message.content.startsWith(prefix)) return; //Depreciated
  if (message.content.indexOf(prefix) !== 0) return;

  const serverQueue = queue.get(message.guild.id);
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'ping') {
    //console.log("Bot_Ping.Pong")
    message.channel.send("Pong! `"+bot.ping+"ms`")
    return;
  } else if (cmd === 'poke') {
    message.channel.send("<a:pawingcat:635163464905523221> "+message.author.toString())
    //console.log("Bot_Poke.Pinger")
    return;
  } else if (cmd === 'play') {
    //console.log("Bot_Music.AddSong")
    execute(message, serverQueue)
    return;
  } else if (cmd === 'np') {
    np(message, serverQueue)
    return;
  } else if (cmd === 'skip') {
    //console.log("Bot_Music.SkipSong")
    skip(message, serverQueue)
    return;
  } else if (cmd === 'stop') {
    //console.log("Bot_Music.StopSong")
    stop(message, serverQueue)
    return;
  } else if (cmd === 'invite') {
    message.channel.send("I'm sorry, I cannot let you do that. Please ask my owner for the invite code.")
    return;
  } else if (cmd === 'info') {
    botCoreInfo(message.channel)
    //console.log("Bot_Embed.CoreInfo")
    return;
  } else if (cmd === 'help'){
    botCoreCmds(message.channel)
    //console.log("Bot_Embed.CoreCmds")
  } else if (cmd === 'userinfo') {
    botUserData(message.channel)
    return;
  } else if (cmd === 'purge') {
    botPurgeMsg()
  } else if (cmd === 'userdata') {
    botRawData_Dev(message.channel)
  } else if (cmd === 'avatar') {
    //console.log("Bot_Avatar.GrabURL")
    botAvatarImg_Dev(message.channel);
    return;
  } else if (cmd === 'restart') {
    //console.log("Bot_Admin.Restart")
    botReset(message.channel);
    return;
  } else if (cmd === 'shutdown') {
    //console.log("Bot_Admin.Shutdown")
    botStop(message.channel);
  } else {
    //console.log("Error! Unknown command!")
    message.channel.send('That command is not in my database!')
  }
  
  // Music Function
  async function execute(message, serverQueue) {
    const args = message.content.split(' ');

    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      console.log("Error! TargetChannel_voicechat.channelNotSpecified")
      return message.channel.send('I need a voicechannel to play music!');} 
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      console.log("Error! InsufficientPerms_voicechat.channelPermsErr")
      return message.channel.send("Insufficient permissions for users channel! Check bot and channel's permissions!");
    }
  
    const songInfo = await YTDL.getInfo(args[1]);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url,
    };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };
      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      //console.log(serverQueue.songs);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  
  function skip(message, serverQueue) {
    if (!message.member.voiceChannel) {
      console.log("Error! UserNotFound_voicechat.channelNoUser") 
      return message.channel.send('You have to be in a voice channel to skip the music!')
    }
    if (!serverQueue) {
      console.log("Error! SkipErr_voicechat.channelSongSkip")
    return message.channel.send('There is no song that I could skip!');
    }
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voiceChannel) {
      console.log("Error! UserNotFound_voicechat.channelNoUser")
      return message.channel.send('You have to be in a voice channel to stop the music!');}
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  function np(message, serverQueue){
    if (!serverQueue) return message.channel.send('There is nothing playing.');
    var embed = new Discord.RichEmbed()
      .setTitle("Now Playing")
      .setColor(0x00FFFF)
      .setThumbnail(bot.user.avatarURL)
      .addField("Currently Playing: ",`${serverQueue.songs[0].title}`)
      .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
      message.channel.send(embed)
		return;
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    const dispatcher = serverQueue.connection.playStream(YTDL(song.url))
      .on('end', () => {
        //console.log('Bot.MusicEnd'); //Debug to check when song ends.
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on('error', error => {
        console.error(error);
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  }
  // Commands Help Handler
  function botCoreCmds(channel) {
    if (!args[0]) {
      var embed = new Discord.RichEmbed()
        .setTitle("Bot Commands :scroll:")
        .setColor(0x00FFFF)
        .setThumbnail(bot.user.avatarURL)
        .addField("Bot Prefix", "Prefix is `>`")
        .addField("Personal :smile_cat:","`info` - Shows some information about me in case you wanted to know more. \n `poke` - Pokes me to grab my attention. Wait... why do I even have this? :eyes: \n `owner` - Want to find out more about my owner?")
        .addField("Music :musical_score:","`play` - Plays some music in a voice channel for me to sing to you :wink: \n `skip` - Skips the song in the queue if it isn't your genre or type `stop` - Stops the music at any time during the song")
        .addField("Admin :cop:","Need these commands? Use `>cmd -mod` to see commands.")
        .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
    channel.send(embed);
    return;
    } else if (args[0] === '-mod') {
      if (message.member.roles.some(role => role.name === 'Staff')) {
        var embed = new Discord.RichEmbed()
          .setTitle("Admin Only Commands :cop:")
          .setColor(0xfcdc2)
          .setThumbnail(bot.user.avatarURL)
          .addField("Bot Prefix", "Prefix is `>`")
          .addField("Moderator+","Currently W.I.P. and not fully implemented right now, sorry.")
          .addField("Owner","`restart` - Refreshes my state and allows me to restart my systems. \n`shutdown` - Deactivates me and shuts down my systems. Required when updating code and core settings")
          .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
        channel.send(embed);
      } else {
        channel.send(":no_entry: Access Denied! :no_entry: \n Moderator permissions required!")
      }
    return;
    } else if (args[0] === '-dev') {
      if (message.member.roles.some(role => role.name === 'BotCMD')) {
        var embed = new Discord.RichEmbed()
          .setTitle("Developer Commands :tools:")
          .setColor(0xfa7829)
          .setThumbnail(bot.user.avatarURL)
          .addField(":warning:WARNING!:warning: ", "For developer use only! \n Some functions may break or cause me to crash! Please use with caution.")
          .addField("AvatarURL","avatar `usage >avatar <userid>`")
          .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
        channel.send(embed);
      } else {
        channel.send(":no_entry: Access Denied! :no_entry: \n Developer permissions required!")
      }
    return;
    } else {
      channel.send("Invalid arguments! Usage `>cmd <arg> [-mod -dev]`")
    }
  }

  // Standard Bot Functions
  function botCoreInfo(channel) {
    if (!args[0]) {
      var embed = new Discord.RichEmbed()
        .setTitle("Core Info Help")
        .setColor(0x00FFFF)
        .setThumbnail(bot.user.avatarURL)
        .addField("You seem lost... what information did you want to see?", "`bot` tells you a bit about myself, Cora the AI. \n`owner` tells you some information about my owner, Novie x3 \n Command usage is `>info <args> [bot, owner]`.")
        .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
      channel.send(embed);
      return; //channel.send("Missing Args! `usage: >info <args> [bot, owner]`");
    }
    if (args[0]==='bot'){
      var embed = new Discord.RichEmbed()
          .setTitle("Bot Information <a:pawingcat:635163464905523221>")
          .setColor(0x00FFFF)
          .setThumbnail(bot.user.avatarURL)
          .addField("Name & TagID:",bot.user.username+' ('+bot.user.tag+')')
          .addField("Created:",bot.user.createdAt)
          .addField("Bot Version:",'v'+version+' compiled with Discord.JS')
          .addField("About Me", "I am Nova's Personal bot. I am mostly used for testing features and stuff. Sometimes I play music but not that well... I do try though ^w^") 
          .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1, coded in Discord.JS v11.5.1")
      channel.send(embed);
      return;
    } else if (args[0]==='owner'){
      var ownerID = '234356998836191232'
      let ownerData = message.guild.member(message.guild.members.get(ownerID))
      //console.log(ownerData)
      var embed = new Discord.RichEmbed()
        .setTitle("My Owner's Info")
        .setColor(0x00FFFF)
        .setThumbnail(ownerData.user.avatarURL) //"https://cdn.discordapp.com/avatars/234356998836191232/3bcf8aa8fabdab92bf753d61db00e548.png?size=2048"
        .addField("Date Joined", ownerData.user.createdAt)
        .addField("About Me", "My name is Nova Lynxie, I am a minecrafter to the core and always will be. I am sometimes shy meeting other people but can be quite friendly once you get to know me. \nLynx's Forever! X3")
        .addField("Social Links", "Twitch: https://www.twitch.tv/novalynxie \nMixer: https://mixer.com/NovaLynxie")
        .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1, coded in Discord.JS v11.5.1")
      channel.send(embed);
      return;
    } else {
      var embed = new Discord.RichEmbed()
        .setTitle("Invalid Command!")
        .setColor(0x00FFFF)
        .setThumbnail(bot.user.avatarURL)
        .addField("Did you enter the command correctly?", "Check you entered the command correctly, \nCommand usage is `>info <args> [bot, owner]`.")
        .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
      channel.send(embed);
      return; //channel.send("Invalid Args! `usage: >info <args> [bot, owner]`");
    }
  }

  // Admin Bot Functions
  function botPurgeMsg() {
    if(!args[0]) return message.reply("Error! Specify messages to clear!")
    message.channel.bulkDelete(args[0]);
    return;
  }

  function botUserData(channel) {
    if (!args.length) {
      return channel.send("Unknown User! \n```usage: >userinfo <args> [@mention, userID]```");
    }
    let userData = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
    //console.log(userData) //debug code line to dump info to console
    var embed = new Discord.RichEmbed()
      .setDescription("__**Member Information**__")
      .setColor(0x15f153)
      .setThumbnail(userData.user.avatarURL)
      .addField("Username", `${userData.user.username}#${userData.user.discriminator}`)
      .addField("User ID", userData.id)
      .addField("Online Status", `${userData.presence.status}`)
      .addField("Created at", userData.user.createdAt)
      .addField("Joined at", userData.joinedAt)
    channel.send(embed)
  }
  function botReset(channel) {
    console.log("CoraBot restarting...")
    channel.send("Restarting, I will be right back. :wink:")
    .then(bot.user.setStatus("dnd"))
    .then(bot.user.setActivity("rebooting..."))
    .then(_msg=>bot.destroy())
    .then(()=>bot.login(token));
  }
  function botStop(channel) {
    console.log("CoraBot deactivating...")
    channel.send("Shutting down. Good night... <:sleepycat:635163563878514688>")
    .then(bot.user.setStatus("dnd"))
    .then(bot.user.setActivity("shutting down..."))
    .then(_msg=>bot.destroy());
  }

  // Dev Bot Functions
  function botAvatarImg_Dev(channel) {
    if (message.member.roles.some(role => role.name === 'BotCMD')) {
      if (!args.length) {
        return channel.send("Missing Args! Usage: >avatar `<UserID>`");
      }
      let rawID = args[0]
      bot.fetchUser(rawID).then(myUser => {
        channel.send(myUser.avatarURL) // My user's avatar is here!
      }).catch(console.error());
    } else {
      channel.send(":no_entry:Access Denied!:no_entry: \nDeveloper permissions required!")
    }
  }
  function botRawData_Dev(channel) {
    if (!args.length) {
      return channel.send("Unknown User! \n```usage: >userinfo <args> [@mention, userID]```");
    }
    let userData = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
    console.log(userData) //debug code to dump info into bot console
    let fileWrite = Flatted.stringify(userData, null, 2)
    var filePath = './cora_modules/cora.debug/datadump_userdata.json'
    fs.writeFileSync(filePath, fileWrite)
    console.log("debug.datadump_userdata -> " + filePath)
    channel.send("Data dump completed successfully! \nCheck my console " + message.author.toString())
  }
});

bot.login(token); // Required to get bot token to interact with discord.