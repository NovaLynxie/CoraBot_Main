//Template for commands to be included as executable command
//Command file must go into ./cora_modules/cora.cmds as <cmd>.js
module.exports = {
    name: 'example_command',
    description: "Command description goes here.",
	aliases: ['ex_cmd'],
	usage: 'example_command <@user>',
	guildOnly: true,
    execute(message) {
        //Command code to be executed goes here.
        //Must use 'message' to send messages back to channel.
    }
};