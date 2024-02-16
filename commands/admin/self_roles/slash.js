import { PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { addSelfRoles, removeSelfRoles } from '../../../shared.js';
import { Message } from '../../../database.js';

/**
 * Sends a `Message` in the current channel and registers for self roles.
 * @param {ChatInputCommandInteraction} interaction
 * @returns {Promise<string>}
 */
const createSelfRoles = async (interaction) => {
	const { options, channel } = interaction;

	// Create message with text input
	const text = options.getString('text');
	const id = (await channel.send(text)).id;

	// Reply successfully to acknowledge command
	await interaction.reply({
		content: `Successfully sent message! Add roles to it with reference ID '${id}'.`,
		ephemeral: true
	});

	return id;
};

/**
 * @typedef {Object} SelfRoleResponse
 * @property {boolean} success Whether or not the operation was successful.
 * @property {string|null} msgID A Discord message ID, if successful.
 */

/**
 * Registers a `Message` for self roles.
 * @param {ChatInputCommandInteraction} interaction
 * @returns {Promise<SelfRoleResponse>}
 */
const registerSelfRoles = async (interaction) => {
	const { options, channel } = interaction;
	const id = options.getString('id');
	const response = {
		success: false,
		msgID: null
	};

	try {
		// Get message by id
		await channel.messages.fetch(id);

		// Reply successfully to acknowledge command
		await interaction.reply({
			content: 'Successfully fetched message!',
			ephemeral: true
		});

		response.success = true;
		response.msgID = id;

		return response;
	} catch (error) {
		console.error(error);

		// Reply failed to acknowledge command
		await interaction.reply({
			content: 'Failed to fetch message!',
			ephemeral: true
		});
	}
	return response;
};

/**
 * Main logic of the 'Self Roles remove' slash command to remove the functionality from a `Message`.
 * @param {ChatInputCommandInteraction} interaction
 * @param {string} msgID A Discord message ID.
 */
const removeReactionRoles = async (interaction, msgID) => {
	const { channel } = interaction;

	try {
		// Try fetching message from channel
		await channel.messages.fetch(msgID);
	} catch (error) {
		console.error(error);
		// Reply to acknowledge command
		await interaction.reply({
			content: `Failed to fetch message!`,
			ephemeral: true
		});
		return;
	}

	// Call shared method for further logic
	await removeSelfRoles(interaction, msgID);
};

export const data = new SlashCommandBuilder()
	.setName('self_roles')
	.setDMPermission(false)
	.setDescription('Manages reactions for self roles.')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('create')
			.setDescription('Creates new message in channel.')
			.addStringOption((option) =>
				option
					.setName('text')
					.setRequired(true)
					.setDescription('The text to be displayed in the message.')
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('register')
			.setDescription('Registers an existing message.')
			.addStringOption((option) =>
				option
					.setName('id')
					.setRequired(true)
					.setDescription('The ID to reference the message to be used.')
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a role-emoji-pair to a message.')
			.addStringOption((option) =>
				option
					.setName('id')
					.setRequired(true)
					.setDescription('The ID to reference the message to be used.')
			)
			.addRoleOption((option) =>
				option.setName('role').setRequired(true).setDescription('The role be assigned to.')
			)
			.addStringOption((option) =>
				option.setName('emoji').setRequired(true).setDescription('The emoji to be reacted with.')
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove self roles from a message.')
			.addStringOption((option) =>
				option
					.setName('id')
					.setRequired(true)
					.setDescription('The ID to reference the message to be removed.')
			)
	);
/** @param {ChatInputCommandInteraction} interaction */
export async function execute(interaction) {
	const { options } = interaction;

	/** @type {string=} */
	let id;
	let createNew = false;
	switch (options.getSubcommand()) {
		case 'create':
			id = await createSelfRoles(interaction);
			// Flag to create new database entry
			createNew = true;
			break;
		case 'register': {
			const response = await registerSelfRoles(interaction);
			id = response.msgID ?? id;
			// Flag to create new database entry
			createNew = response.success;
			break;
		}
		case 'add': {
			// Get command options
			const msgID = options.getString('id');
			const role = options.getRole('role');
			const emoji = options.getString('emoji');
			// Try adding self role pair
			await addSelfRoles(interaction, msgID, role, emoji);
			break;
		}
		case 'remove': {
			const msgID = options.getString('id');
			await removeReactionRoles(interaction, msgID);
			break;
		}
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
				ephemeral: true
			});
		}

		console.info(`[INFO] New self roles on message with ID: '${id}'.`);
	}
}
