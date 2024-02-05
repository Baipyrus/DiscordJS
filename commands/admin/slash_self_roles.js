import { Op } from 'sequelize';
import { SlashCommandBuilder } from 'discord.js';
import { Message, RoleEmojiPair } from './../../database.js';

const createSelfRoles = async (interaction) => {
	const { options, channel } = interaction;

	// Create message with text input
	const text = options.getString('text');
	const id = (await channel.send(text)).id;

	// Reply and delete to acknowledge command
	await interaction.deferReply();
	await interaction.deleteReply();

	return id;
};

const registerSelfRoles = async (interaction) => {
	const { options, channel } = interaction;
	const id = options.getString('id');
	const response = {
		success: false,
		msgID: null,
	};

	try {
		// Get message by id
		await channel.messages.fetch(id);

		// Reply successfully to acknowledge command
		await interaction.reply({
			content: 'Successfully fetched message!',
			ephemeral: true,
		});

		response.success = true;
		response.msgID = id;

		return response;
	} catch (error) {
		console.error(error);

		// Reply failed to acknowledge command
		await interaction.reply({
			content: 'Failed to fetch message!',
			ephemeral: true,
		});
	}
	return response;
};

const saveMessageData = async (id, role, emoji) => {
	// Try finding existing entry
	const rep = await RoleEmojiPair.findOne({
		where: {
			[Op.or]: [
				{
					message: id,
					role: role.id
				}, {
					message: id,
					emoji
				}
			]
		}
	});
	if (rep !== null) throw new Error(`Failed to fetch RoleEmojiPair entry with data {message:${id},role:${role.id},emoji:${emoji}}!`);

	// Create database entry for pair
	await RoleEmojiPair.create({ message: id, role: role.id, emoji });
};

const addSelfRoles = async (interaction) => {
	const { options, channel } = interaction;
	const id = options.getString('id');

	let step = 'fetch';
	try {
		// Get message by id
		const message = await channel.messages.fetch(id);

		// Get user arguments
		const role = options.getRole('role');
		const emoji = options
			.getString('emoji')
			.replace(/:.*?:/, ':_:');

		step = 'save data from';
		await saveMessageData(id, role, emoji);

		step = 'react to';
		// React with emoji to message
		await message.react(emoji);

		// Reply successfully to acknowledge command
		await interaction.reply({
			content: 'Added new entry for self roles!',
			ephemeral: true,
		});

		console.info(`[INFO] Added new entry to get role with ID '${role.id}' using '${emoji}'.`);
	} catch (error) {
		console.error(error);

		// Reply failed to acknowledge command
		await interaction.reply({
			content: `Failed to ${step} message!`,
			ephemeral: true,
		});
	}
}

export const data = new SlashCommandBuilder()
	.setName('self_roles')
	.setDescription('Manages reactions for self roles.')
	.addSubcommand(subcommand =>
		subcommand
			.setName('create')
			.setDescription('Creates new message in channel.')
			.addStringOption(option =>
				option
					.setName('text')
					.setRequired(true)
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
	const { options } = interaction;

	let createNew = false, id;
	switch (options.getSubcommand()) {
		case 'create':
			id = await createSelfRoles(interaction);
			// Flag to create new database entry
			createNew = true;
			break;
		case 'register':
			const { success, msgID } = await registerSelfRoles(interaction);
			id = msgID ?? id;
			// Flag to create new database entry
			createNew = success;
			break;
		case 'add':
			await addSelfRoles(interaction);
			break;
	}

	if (createNew) {
		try {
			// Create database entry
			await Message.create({ id });
		} catch (error) {
			console.error(error);

			// Reply failed to acknowledge command
			await interaction.followUp({
				content: 'Failed to save data from message!',
				ephemeral: true,
			});
		}

		console.info(`[INFO] New self roles on message with ID: '${id}'.`);
	}
}
