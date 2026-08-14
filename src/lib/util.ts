import { MessageFlags, type RepliableInteraction } from 'discord.js';

export async function replyOrFollowUp(
	interaction: RepliableInteraction,
	content: string,
	ephemeral: boolean = true
) {
	const flags = ephemeral ? MessageFlags.Ephemeral : undefined;

	if (interaction.replied || interaction.deferred) {
		await interaction.followUp({ content, flags });
		return;
	}

	await interaction.reply({ content, flags });
}
