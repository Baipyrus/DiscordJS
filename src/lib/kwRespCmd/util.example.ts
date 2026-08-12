import { type ChatInputCommandInteraction } from 'discord.js';
import { findResponsesWithKeyword } from '$lib/kwRespCmd/queries.example.js';
import { EMPTY } from '$lib/constants.js';
import { replyOrFollowUp } from '$lib/util.js';

export async function listResponses(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);

	const responses = await findResponsesWithKeyword(guildId!, keyword);
	if (responses.length === EMPTY)
		return await replyOrFollowUp(interaction, `No responses for '${keyword}' are registered yet.`);

	const responseStr = responses.map((r) => r.name).join('\n- ');
	await replyOrFollowUp(interaction, `Responses for '${keyword}':\n- ${responseStr}`);
}
