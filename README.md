***WARNING! CoraBot v4.x.x is still in alpha stages! It may be broken or not work at all due to continuous developmental changes! Please remain on CoraBot v3 at this time.***
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
***WARNING! CoraBot v4 is not backwards compatible with v3.x.x and older versions since there are multiple breaking changes to how it runs! No support will be offered if you do not install it correctly!***  
*If you have v3 or older installed, please backup before upgrading or install in a different directory!*
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

