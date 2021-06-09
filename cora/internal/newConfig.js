const fs = require('fs');
// Depreciated! Please use npm run setup in v3.x.x!
// Config Template (DO NOT EDIT THIS UNLESS CONFIG IS UPDATED!)
const cfgTemplate = `
# CoraBot Configuration file.

[general]
# Bot general settings.
# Set the bot's prefix for commands and other options here.
prefix = "<PREFIX>"
# Bot Modules. To enable them, change from false to true.
# Developer only setting! Use this only for debugging the config file.
debug = false

[chatbot]
# ChatBot settings. Powered by discord-chatbot.
enableChatBot = true
# Channels ChatBot module can talk in. # Channels ChatBot module can talk in. 
# This will only accept channel IDs NOT channel names.
chatChannels = []

[images]
# Image modules settings.
# Client name is used for identifying the bot using some modules.
# If left blank, the bot will try to use a temporary client name.
# This is not recommended as requests from this bot instance may get blocked in future.
clientName = "<CLIENTNAME>"
# API Key for usage with the yiffy module in api calls to yiff.rest for furry command. Required for request calls to Yiffy's API.
# Get your API key from https://yiff.rest/support and run the command '/apikey create' in their discord support server.
yiffyApiKey = "<YIFFYAPIKEY>"
# Put key in a .env and type 'hidden' if this will be cloud hosted!

[autoLogger] 
# Logging module settings.
enableLogger = "yes"
# This only takes channel IDs! Attempting to use a channel name will fail if the name changes!
# If not defined, will try to fallback to #logs channel if available.
logChannels = []
# Ignore specific channels. Prevents log spam caused by many updates from said channels.
ignoredChannels = []
  [autoLogger.logEvents]
  # Log message edits, join/leave events and more. 
  # Channel must be set otherwise these will be ignored!
  messageUpdates = true
  userJoinLeaves = true
  roleUpdates = true

[autoModerator]
# Auto moderation settings.
enableAutoMod = "yes"
# Whether to use channelsList as whitelist or blacklist.
chListMode = "whitelist"
# Channels to observe in the mode selected.
# This only accepts channel IDs, NOT channel names. Using channel name will cause the moderator to fail.
# To get the channel's ID, enable 'Developer Mode' in User Settings -> Appearance -> Advanced.
channelsList = []
# URL domains to check when removing messages.
urlBlacklist = [ "tenor.com/view/", "media.giphy.com/media/" ]
# URL domains to ignore when removing messages.
urlWhitelist = [ "" ]

  [autoModerator.mediaOptions]
  # These tell which types of media the auto moderator should look for.
  removeGifs = "yes"
  removeVids = "no"
  removeImgs = "no"
  removeURLs = "yes"
  # Note: removeVids and removeImgs are very experimental.
  # Please use them with caution as they are currently WIP.

`; // Config Template (DO NOT EDIT!)
fs.writeFile('./config.toml', cfgTemplate, { flag: 'wx' }, function (err) {
    if (err) {
      console.log('Bot config already exists!')
      return console.error(err);
      };
    // Respond with this in console
    console.log("Generated new config as config.toml!");
});