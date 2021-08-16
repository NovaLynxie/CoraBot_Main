module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
    let client = interaction.client;
		console.log(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered interaction '${interaction.commandName}'`);
    if (!interaction.isCommand()) return;
    if (!client.slashcmds.has(interaction.commandName)) return;
    try {
      await client.slashcmds.get(interaction.commandName).execute(interaction, interaction.client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
	},
};