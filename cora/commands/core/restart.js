const { Command } = require('discord.js-commando');
const {tokens} = require('../../handlers/bootLoader');
const {discordToken} = tokens;
const logger = require('../../providers/WinstonPlugin');
module.exports = class RestartCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      aliases: ['reboot', 'reset'],
      group: 'core',
      memberName: 'restart',
      description: 'Restarts the bot instance.',
      ownerOnly: true
    });
  }
  run(message) {
    logger.info("Restart command received!")
    logger.warn("Status may be out of sync for a few minutes.")
    message.say("Will be right back.")
      .then(logger.info("Restarting my systems..."))
      .then(_msg => this.client.destroy())
      .then(_msg => this.client.login(discordToken))
      .then(logger.info("Restart completed successfully!"))
      .then(_msg => this.client.user.setActivity('with Commando'));
  }
}