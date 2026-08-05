import type { AutocompleteInteraction } from 'discord.js';
import { getKeywordChoices, getResponseChoices } from '$lib/kwRespCmd/queries.js';

export async function handleKeywordAutocomplete(interaction: AutocompleteInteraction) {
	const { options, guildId } = interaction;
	const focused = options.getFocused(true).value;

	// Unallowed in DMs and no keywords to be listed
	if (!guildId) return;

	const choices = await getKeywordChoices(guildId, focused);
	await interaction.respond(choices);
}

export async function handleResponseAutocomplete(interaction: AutocompleteInteraction) {
	const { options, guildId } = interaction;
	const focused = options.getFocused(true).value;
	const keyword = options.getString('keyword', true);

	// Unallowed in DMs and no responses to be listed
	if (!guildId) return await interaction.respond([]);

	const choices = await getResponseChoices(guildId, keyword, focused);
	await interaction.respond(choices);
}
