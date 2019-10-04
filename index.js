const Discord = require("discord.js")
const YTDL = require("ytdl-core")
const {
	prefix,
	token,
} = require('./config.json');
const {
  version,
} = require('./package.json');

// Functions for DiscordBot
function play(connection, message) {
  var server = servers[message.guild.id]
  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
  server.queue.shift();
  server.dispatcher.on("end",function() {
    if (server.queue[0]) play(connection, message)
    else connection.disconnect()
  })
};
  // Variables for DiscordBot
  var bot = new Discord.Client();
  var servers = [];
  const queue = new Map();
  // Bot.on Commands
  bot.on('ready', () => {
    bot.user.setStatus('online')
    bot.user.setActivity("with my code x3", {type:'PLAYING'});
    console.log("CoraBot ONLINE!")
  })
  // Bot Command Handler
  bot.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}ping`)) {
      console.log("Bot_Ping.Pong")
      message.channel.send("Pong!")
      return;
    } else if (message.content.startsWith(`${prefix}help`)){
      var embed = new Discord.RichEmbed()
          .setTitle("Bot Commands :scroll:")
          .setColor(0x00FFFF)
          .setThumbnail(bot.user.avatarURL)
          .addField("Bot Prefix", "Prefix is `>`")
          .addField("Personal Commands :smile_cat:","info, poke")
          .addField("Music Commands :musical_score:","play, skip, stop")
          .addField("Admin Commands :cop:","restart, shutdown")
          .setFooter("Created by NovaLynxie#9765")
      message.channel.send(embed);
      //console.log("Bot_Embed.Help")
    } else if (message.content.startsWith(`${prefix}info`)) {
      var embed = new Discord.RichEmbed()
          .setTitle("Bot Information")
          .setColor(0x00FFFF)
          .setThumbnail(bot.user.avatarURL)
          .addField("Name & TagID:",bot.user.username+' ('+bot.user.tag+')')
          .addField("Created:",bot.user.createdAt)
          .addField("Bot Version:",'v'+version)
          .addField("About Me", "I am Nova's Personal bot. I am mostly used for testing features and stuff. Sometimes I play music but not that well... I do try though ^w^") 
          .setFooter("Created by NovaLynxie#9765")
      message.channel.send(embed);
      //console.log("Bot_Embed.Info")
      return;
    } else if (message.content.startsWith(`${prefix}poke`)) {
      message.channel.send("Hello " + message.author.toString())
      //console.log("Bot_Poke.Pinger")
      return;
    } else if (message.content.startsWith(`${prefix}invite`)) {
      message.channel.send("I'm sorry, I cannot let you do that. Please ask my owner for the invite code.")
      return;
    } else if (message.content.startsWith(`${prefix}play`)) {
      //console.log("Bot_Music.AddSong")
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
      //console.log("Bot_Music.SkipSong")
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
      //console.log("Bot_Music.StopSong")
      stop(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}restart`)) {
      //console.log("Bot_Admin.Restart")
      resetBot(message.channel);
      return;
    } else if (message.content.startsWith( `${prefix}shutdown`)) {
      //console.log("Bot_Admin.Shutdown")
      stopBot(message.channel);
    } else {
      message.channel.send('That command is not in my database!')
      console.log("Error! Unknown command!")
    }

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
        console.log(serverQueue.songs);
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
    
    function play(guild, song) {
      const serverQueue = queue.get(guild.id);
      if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
      }
      const dispatcher = serverQueue.connection.playStream(YTDL(song.url))
        .on('end', () => {
          console.log('Music_QueueEmpty.voicechat.channelDisconnect');
          serverQueue.songs.shift();
          play(guild, serverQueue.songs[0]);
        })
        .on('error', error => {
          console.error(error);
        });
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }

    function resetBot(channel) {
      console.log("CoraBot restarting...")
      channel.send("Restarting, I will be right back. :wink:")
      .then(bot.user.setStatus("dnd"))
      .then(bot.user.setActivity("rebooting..."))
      .then(_msg=>bot.destroy())
      .then(()=>bot.login(token));
    }

    function stopBot(channel) {
      console.log("CoraBot deactivating...")
      channel.send("Shutting down. Good night... :sleeping:")
      .then(bot.user.setStatus("dnd"))
      .then(bot.user.setActivity("shutting down..."))
      .then(_msg=>bot.destroy());
    }
  });

bot.login(token);