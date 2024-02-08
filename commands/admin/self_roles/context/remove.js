import { removeSelfRoles } from '../../../../shared.js';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
	.setDMPermission(false)
	.setName('Remove self roles')
	.setType(ApplicationCommandType.Message);
export async function execute(interaction) {
	const id = interaction.targetMessage.id;
	await removeSelfRoles(interaction, id);
}
