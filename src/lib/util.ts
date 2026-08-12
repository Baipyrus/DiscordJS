import { MessageFlags, type RepliableInteraction } from 'discord.js';

export async function replyOrFollowUp(interaction: RepliableInteraction, content: string) {
	if (interaction.replied || interaction.deferred)
		await interaction.followUp({ content, flags: MessageFlags.Ephemeral });

	await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}
