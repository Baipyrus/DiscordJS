import { SlashCommandBuilder } from 'discord.js';
import { Message, RoleEmojiPair } from './../../database.js';

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
			.setName('register')
			.setDescription('Registers an existing message.')
			.addStringOption(option =>
				option
					.setName('id')
					.setRequired(true)
					.setDescription('The ID to reference the message to be used.')))
	.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Add a role-emoji-pair to a message.')
			.addStringOption(option =>
				option
					.setName('id')
					.setRequired(true)
					.setDescription('The ID to reference the message to be used.'))
			.addRoleOption(option =>
				option
					.setName('role')
					.setRequired(true)
					.setDescription('The role be assigned to.'))
			.addStringOption(option =>
				option
					.setName('emoji')
					.setRequired(true)
					.setDescription('The emoji to be reacted with.')));
export async function execute(interaction) {
	const channel = interaction.channel;

	let createNew = false;
	let id = interaction.options.getString('id');
	switch (interaction.options.getSubcommand()) {
		case 'create':
			// Create message with text input
			const text = interaction.options.getString('text');
			id = (await channel.send(text)).id;
			// Reply and delete to acknowledge command
			interaction.deferReply();
			interaction.deleteReply();
			// Flag to create new database entry
			createNew = true;
			break;
		case 'register':
			try {
				// Get message by id
				await channel.messages.fetch(id);
				// Reply successfully to acknowledge command
				await interaction.reply({
					content: 'Successfully fetched message!',
					ephemeral: true,
				});
				// Flag to create new database entry
				createNew = true;
			} catch (_) {
				// Reply failed to acknowledge command
				await interaction.reply({
					content: 'Failed to fetch message!',
					ephemeral: true,
				});
			}
			break;
		case 'add':
			const role = interaction.options.getRole('role');
			const emoji = interaction.options.getString('emoji');

			// Reply successfully to acknowledge command
			await interaction.reply({
				content: 'Added new entry for self roles!',
				ephemeral: true,
			});

			RoleEmojiPair.create({ message: id, role: role.id, emoji });

			console.debug(`[DEBUG] Added new entry to get role with ID '${role.id}' using '${emoji}'.`);
			break;
	}

	if (createNew) {
		console.debug(`[DEBUG] New self roles on message with ID: '${id}'.`);
		Message.create({ id });
	}
}
