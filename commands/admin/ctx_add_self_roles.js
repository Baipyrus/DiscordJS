import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { RoleEmojiPair } from '../../database.js';
import {
	ComponentType,
	ActionRowBuilder,
	RoleSelectMenuBuilder,
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
	console.log(interaction);

	// await interaction.reply({
	// 	content: 'Successfully submitted Form!',
	// 	ephemeral: true
	// });
}
export async function execute(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('Add role emoji pair-pair')
		.setTitle('Role Emoji Pair');

	const roleSelector = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('Enter exactly one role ID.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('role')
			.setRequired(true));

	// const roles = await interaction.guild.roles.fetch();
	// const selection = roles.find((r) =>
	// 	roleInteraction.values.includes(r.id)
	// );

	const emojiTextInput = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('Enter exactly one emoji.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('emoji')
			.setRequired(true));

	// const id = interaction.targetMessage.id;
	// await addSelfRoles(interaction, id, emoji, role);

	modal.addComponents(roleSelector, emojiTextInput);

	await interaction.showModal(modal);
}
