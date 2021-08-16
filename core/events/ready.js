const {storeHandler} = require('../modules/storehandler');
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag}. Bot Online!`);
    let guilds = client.guilds.cache;
    let data = {
      guilds: guilds,
      mode: 'g'
    }
    storeHandler(data, client);
	},
};