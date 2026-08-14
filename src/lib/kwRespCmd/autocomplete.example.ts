import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import { findKeywords, findResponsesWithKeyword } from '$lib/kwRespCmd/queries.example.js';

export async function handleKeywordAutocomplete(interaction: AutocompleteInteraction) {
	const { options, guildId } = interaction;
	const focused = options.getFocused(true).value;

	// Unallowed in DMs and no keywords to be listed
	if (!guildId) return await interaction.respond([]);

	const results = await findKeywords(guildId);
	await interaction.respond(
		results
			.filter((k) => k.word.indexOf(focused) > -1)
			.map((k) => ({ name: k.word, value: k.word }) as ApplicationCommandOptionChoiceData)
	);
}

export async function handleResponseAutocomplete(interaction: AutocompleteInteraction) {
	const { options, guildId } = interaction;
	const focused = options.getFocused(true).value;
	const keyword = options.getString('keyword', true);

	// Unallowed in DMs and no responses to be listed
	if (!guildId) return await interaction.respond([]);

	const results = await findResponsesWithKeyword(guildId, keyword);
	await interaction.respond(
		results
			.filter((r) => r.name.indexOf(focused) > -1)
			.map((r) => ({ name: r.name, value: r.name }) as ApplicationCommandOptionChoiceData)
	);
}
