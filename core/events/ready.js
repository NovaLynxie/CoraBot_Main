const {storeHandler} = require('../modules/storehandler');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Logged in as ${client.user.tag}. Bot Online!`);
    let guilds = client.guilds.cache.map(g => g.id);
    let data = {
      guilds: guilds,
      mode: 'g'
    };    
    await storeHandler(data, client);
	},
};