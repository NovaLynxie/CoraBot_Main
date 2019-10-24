# CoraBot - The beta version of this customizable discord bot built on DiscordJS with NodeJS
 CoraBot Discord.JS bot for hosting locally on PC or other hostable device. 
 This version is not for online hosting!
 Warning! This branch is the beta version of the code and is mainly for testing only! 
 I do not recommend that you use this version if you don't know what you are modifying or adding to the code. No support is or will be offered for this version if you change or modify the code, breaking the bot's functionality and is to be used as is.
 
# Cora's Development Bay
 Hi there! Cora here. Welcome to my beta testing bay where my owner works with new code or major changes that affect my system functions.
 Here, we test new code implementations and modified versions of my release version.
 Some functions may crash me or cause errors to be spammed into my console but that is the role of beta testing. 

# Setting up the bot instance
 To setup a local host instance, download the latest stable release for your system and run the setup script file in the bot's directory to install required dependencies. 
 You will also need to provide a bot token to interface the bot with my code and set the bots prefix. These can be set inside the config.json in the root of the bot's directory.
 
# My bot doesn't work or music will not play back... help?
 Should a module dependency fail to install correctly or a bot function not work properly, reinstall the required dependency by running the following commands:
 `npm uninstall <module_name>` followed by `npm install --s <module_name>`
 If the music play command not work or cause an error, it means the module 'node-opus' may have failed to install or build correctly on setup. 
 Open a command prompt and navigate to your bot's root directory, make sure its the root of the bot's directory and not node_modules.
 Run `npm uninstall node-opus` followed by `npm install --s node-opus` to reinstall the module.