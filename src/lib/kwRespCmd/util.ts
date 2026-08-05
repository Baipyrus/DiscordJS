import { logger } from '$lib/Logger.js';
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Interaction,
	RepliableInteraction
} from 'discord.js';
import { findResponsesWithKeyword } from '$lib/kwRespCmd/queries.js';
import { EMPTY } from '$lib/constants.js';

export async function replyOrFollowUp(interaction: RepliableInteraction, content: string) {
	if (interaction.replied || interaction.deferred)
		await interaction.followUp({ content, ephemeral: true });

	await interaction.reply({ content, ephemeral: true });
}

export function autocompleteError(interaction: AutocompleteInteraction) {
	interaction.respond([]);
}

export function logkwRespCmd(interaction: Interaction, action: string, label = 'CMD') {
	const name =
		'commandName' in interaction
			? interaction.commandName
			: 'customId' in interaction
				? interaction.customId
				: 'unknown';

	logger.info(`${action}: ${name}`, { label });
}

export async function listResponses(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);

	const responses = await findResponsesWithKeyword(guildId!, keyword);
	if (responses.length === EMPTY)
		return await replyOrFollowUp(interaction, `No responses for '${keyword}' are registered yet.`);

	const responseStr = responses.map((r) => r.name).join('\n- ');
	await replyOrFollowUp(interaction, `Responses for '${keyword}':\n- ${responseStr}`);
}
