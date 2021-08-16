module.exports = {
  data: {
    name: 'ping',
    category: 'util',
    description: "Replies with 'Pong!' and provides ping time."
  },
	async execute(interaction, client) {
    await interaction.reply(
      { 
        content: `Pong! :heartpulse: ${client.ws.ping}ms`,
        ephemeral: true
      }
    );
	},
};