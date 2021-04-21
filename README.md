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

### Requirements
- Node.js v12 or higher.
- FFmpeg v4 or higher.

FFmpeg is required for all voice interactions to work correctly.

To setup a local host instance, clone this repository, navigate to the bot's directory root and open a command line. Run the command 'npm install' to begin installing dependencies.
This will install all modules for the bot to run correctly.
You will also need to provide a bot token to interface the bot with my code and set the bots prefix. Open the example.env file and edit the line botToken=BOT_TOKEN_HERE, replace BOT_TOKEN_HERE with your token.
*Installation and setup scripts are planned for v2.0 for easier setup.*

## My bot doesn't work or music will not play back... help?
Should a module dependency fail to install correctly or a bot function not work properly, reinstall the required dependency by running the following commands:
`npm uninstall <module_name>` followed by `npm install --s <module_name>`
If the music play command not work or cause an error, it means the module 'node-opus' may have failed to install or build correctly on setup.
Open a command prompt and navigate to your bot's root directory, make sure its the root of the bot's directory and not node_modules.
Run `npm uninstall node-opus` followed by `npm install --s node-opus` to reinstall the module.
