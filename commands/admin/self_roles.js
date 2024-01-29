import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('self_roles')
	.setDescription('Manages reactions for self roles.')
	.addSubcommand(subcommand =>
		subcommand
			.setName('create')
			.setDescription('Creates new message in channel.')
			.addStringOption(option =>
				option
					.setRequired(true)
					.setName('text')
					.setDescription('The text to be displayed in the message.')))
	.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Adds functionality to an existing message.')
			.addStringOption(option =>
				option
					.setName('id')
					.setRequired(true)
					.setDescription('The ID to reference the message to be used.')));
export async function execute(interaction) {
	const channel = interaction.channel;
	let message = null;

	switch (interaction.options.getSubcommand()) {
		case 'create':
			// Create message with text input
			const text = interaction.options.getString('text');
			message = await channel.send(text);
			// Reply and delete to acknowledge command
			interaction.deferReply();
			interaction.deleteReply();
			break;
		case 'add':
			// Get message by id
			const id = interaction.options.getString('id');
			message = await channel.messages.fetch(id);
			// Reply to acknowledge command
			await interaction.reply({
				content: 'Successfully fetched message!',
				ephemeral: true,
			});
			break;
	}

	console.debug(`[DEBUG] Message ID: '${message.id}'.`);
}
