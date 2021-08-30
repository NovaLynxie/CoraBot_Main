module.exports = {
    data: {
        name: 'stream',
        category: 'music',
        description: "Plays back an audio stream in the user's voice channel."
    },
    execute(interaction, client) {
        let voiceChannel = interaction.user.voiceChannel;
    }
}