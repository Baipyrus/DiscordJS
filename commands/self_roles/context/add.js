import {
	ModalBuilder,
	TextInputStyle,
	ActionRowBuilder,
	TextInputBuilder,
	PermissionFlagsBits,
	ModalSubmitInteraction,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	ContextMenuCommandInteraction
} from 'discord.js';
import { addSelfRoles } from '#lib/shared.js';

export const data = new ContextMenuCommandBuilder()
	.setDMPermission(false)
	.setName('Add role emoji pair')
	.setType(ApplicationCommandType.Message)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
/** @param {ModalSubmitInteraction} interaction */
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
			ephemeral: true
		});
		return;
	}

	await addSelfRoles(interaction, message, role, emoji);
}
/** @param {ContextMenuCommandInteraction} interaction */
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
			.setValue(id)
	);

	const role = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('Enter exactly one role ID.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('role')
			.setRequired(true)
	);

	const emoji = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('Enter exactly one emoji.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('emoji')
			.setRequired(true)
	);

	modal.addComponents(message, role, emoji);

	await interaction.showModal(modal);
}
