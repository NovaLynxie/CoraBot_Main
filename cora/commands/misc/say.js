const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'misc',
            memberName: 'say',
            description: 'I say what you tell me to say.',
            examples: ['say Hello World!'],
            args: [
                {
                    key: 'text',
                    prompt: 'What would you like me to say?',
                    type: 'string'
                }
            ]
        });
    }
    run(message, args) {
        const { text } = args;
        return message.say(text);
    }
};