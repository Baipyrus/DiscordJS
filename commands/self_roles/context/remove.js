import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	PermissionFlagsBits,
	ContextMenuCommandInteraction
} from 'discord.js';
import { removeSelfRoles } from '../../../shared.js';

export const data = new ContextMenuCommandBuilder()
	.setDMPermission(false)
	.setName('Remove self roles')
	.setType(ApplicationCommandType.Message)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
/** @param {ContextMenuCommandInteraction} interaction */
export async function execute(interaction) {
	const id = interaction.targetMessage.id;
	await removeSelfRoles(interaction, id);
}
