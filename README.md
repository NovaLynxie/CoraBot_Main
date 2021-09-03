# CoraBot - A customizable discord bot built on DiscordJS with NodeJS
CoraBot Discord.JS bot for managing your discord guild or community server!

## About Cora
My name is CoraBot. I am NovaLynxie's personal discord bot.
A while back, I was made as a small test bot to help run experimental features and help them as a discord bot for their guild.
Now, I am much more stable compared to my early days of running experimental code and testing the limits of what I could achieve.
My main purpose is to help you bring some life to your discord guild or community server, wherever I can.
I can play some music for you, give you information about me or help you moderate your own guild using my own custom built admin commands!
Don't worry, I also come with a help command so you can find out what commands I have, just ask whenever you're having trouble remembering one of my commands.

## Setting up the bot instance (WIP)
***WARNING! CoraBot v3.x.x is not backwards compatible with v2.x.x and older versions since there are multiple breaking changes to how it runs!*** 
*If you have v2.x.x installed, please backup before upgrading or install v3.x.x to a different directory! 
It is recommended to remove older versions since v3.x will be more up to date.*  
### Requirements
- Node.js v12 or higher.
- FFmpeg v4 or higher.
- privileged Intents enabled on Discord Bot User! (3.x.x ONLY!)

FFmpeg is required for all voice interactions to work correctly.

To setup a local host instance, clone this repository, navigate to the bot's directory root and open a command line, and type either of the following:  
1. Use `npm install` if setting up for the first time.  
2. Use `npm clean-install` if upgrading from CoraBot v2. (BACKUP FIRST!)

This will install all required modules for the bot to run correctly. *Option 2 will take longer as it has to check for existing modules.*

Once installation is completed, run this command: `npm run setup`.  
This will start the setup utility, follow the on-screen prompts to complete the bot setup process.  
**IMPORTANT!!**
**Privileged intents are required for the bot to start. Check you have it enabled for your bot user before starting or the bot WILL crash!**
## My bot doesn't work or music will not play back... help?
The bot may be missing permissions to speak or connect to the connected voice channel in your server. Please check any roles it has and that the correct permissions are granted.
It is also possible there may have been an error installing the `opus`,`ytdl-core` or `ffmpeg-static` modules during `npm install`. These are responsible for handling music play back and audio streaming functions.
You might also be missing FFmpeg on your system, this is mentioned in the requirements.
Try reinstalling the aformentioned modules by running these commands in this order:  
1. `npm uninstall <module_name>`  
2. `npm install --s <module_name>`  
Should this still fail, try running `npm clean-install`.  
Please note running a clean install will take a while as this uninstalls all bot dependencies and downloads a fresh install, so only use this as a last resort.

## YouTube music support (IMPORTANT)
This bot may not support music playback from YouTube links going forward.
Please see issue #11 for more details.
