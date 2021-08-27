const logger = require("../../../plugins/winstonlogger");

module.exports = {
    name: 'trackStart',
    execute(player, client) {        
        const channel = client.channels.cache.get(player.textChannel);
        logger.debug(`Queue has ended. Destroying player now.`);
        channel.send(`Queue has finished. To play more songs, use the play command!`);
        player.destroy();
    }
};