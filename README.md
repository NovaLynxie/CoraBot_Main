# CoraBot - A customizable discord bot built on DiscordJS with NodeJS
CoraBot Discord.JS bot for hosting locally on PC or other hostable device. This version is not for online hosting!  
*This version is no longer being updated and no support will be available. Please update to v2.0 as all development has moved to this version.*

# About Cora
My name is CoraBot. I am NovaLynxie's personal discord bot.
A while back, I was made as a small test bot to help run experimental features and help them as a discord bot for their guild.
Now, I am much more stable compared to my early days of running experimental code and testing the limits of what I could achieve.
My main purpose is to help you bring some life to your discord guild or community server, wherever I can.
I can play some music for you, give you information about me or help you moderate your own guild using my own custom built admin commands!
Don't worry, I also come with a help command so you can find out what commands I have, just ask whenever you're having trouble remembering one of my commands.

# Setting up the bot instance
### Requirements (v1.0)
- Node.js v10 or higher.
- FFmpeg v2 or higher.
To setup a local host instance, download the latest stable release for your system and run the setup script file in the bot's directory to install required dependencies.
You will also need to provide a bot token to interface the bot with my code and set the bots prefix. These can be set inside the config.json in the root of the bot's directory.

# My bot doesn't work or music will not play back... help?
Should a module dependency fail to install correctly or a bot function not work properly, reinstall the required dependency by running the following commands:
`npm uninstall <module_name>` followed by `npm install --s <module_name>`
If the music play command not work or cause an error, it means the module 'node-opus' may have failed to install or build correctly on setup.
Open a command prompt and navigate to your bot's root directory, make sure its the root of the bot's directory and not node_modules.
Run `npm uninstall node-opus` followed by `npm install --s node-opus` to reinstall the module.
