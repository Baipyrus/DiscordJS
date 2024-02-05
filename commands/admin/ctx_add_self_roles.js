import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { RoleEmojiPair } from '../../database.js';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder
} from 'discord.js';
import { ModalBuilder } from 'discord.js';

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

const addSelfRoles = async (interaction, msgID, emoji, role) => {
	const { channel } = interaction;

	let step = 'fetch';
	try {
		// Get message by id
		const message = await channel.messages.fetch(msgID);

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

export const data = new ContextMenuCommandBuilder()
	.setDMPermission(false)
	.setName('Add role emoji pair')
	.setType(ApplicationCommandType.Message);
export async function modalSubmit(interaction) {
	const { fields, guild } = interaction;
	// Get text inputs from modal
	const message = fields.getTextInputValue('message');
	const roleID = fields.getTextInputValue('role');
	const emoji = fields.getTextInputValue('emoji');

	// Fetch role from guild
	const role = await guild.roles.fetch(roleID);
	// Role not found
	if (role === null) {
		await interaction.reply({
			content: 'Could not fetch role! Please contact server staff.',
			ephemeral: true,
		});
		return;
	}

	await addSelfRoles(interaction, message, emoji, role);
}
export async function execute(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('Add role emoji pair-pair')
		.setTitle('Role Emoji Pair');

	const id = interaction.targetMessage.id;
	const message = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('The message ID this command is run on.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('message')
			.setRequired(true)
			.setValue(id));

	const role = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('Enter exactly one role ID.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('role')
			.setRequired(true));

	const emoji = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('Enter exactly one emoji.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('emoji')
			.setRequired(true));

	modal.addComponents(message, role, emoji);

	await interaction.showModal(modal);
}
