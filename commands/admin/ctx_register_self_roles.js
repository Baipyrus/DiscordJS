import { Message } from '../../database.js';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
	.setDMPermission(false)
	.setName('Register self roles')
	.setType(ApplicationCommandType.Message);
export async function execute(interaction) {
	const id = interaction.targetMessage.id;

	try {
		// Create database entry
		await Message.create({ id });

		// Reply successfully to acknowledge command
		await interaction.reply({
			content: `Successfully saved data from message! Add roles to it with reference ID '${id}'.`,
			ephemeral: true,
		});

		console.info(`[INFO] New self roles on message with ID: '${id}'.`);
	} catch (error) {
		console.error(error);
		// Reply failed to acknowledge command
		await interaction.reply({
			content: 'Failed to save data from message!',
			ephemeral: true,
		});
	}
}
