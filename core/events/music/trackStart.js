const logger = require("../../../plugins/winstonlogger");

module.exports = {
    name: 'trackStart',
    execute(player, track, client) {
        const channel = client.channels.cache.get(player.textChannel);
        logger.debug(`Playing ${track.title}, requested by ${track.requester.tag}`);
        channel.send(`Now playing: \`${track.title}\`, requested by \`${track.requester.tag}\`.`);
    }
};