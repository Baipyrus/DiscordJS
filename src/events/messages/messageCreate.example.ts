import { keywords, responses, keywordReactions, reactions } from '$lib/db/schema.js';
import { Events, Message } from 'discord.js';
import { EMPTY } from '$lib/constants.js';
import { db } from '$lib/db/index.js';
import { and, eq, inArray } from 'drizzle-orm';
import { logger } from '$lib/Logger.js';

export const name = Events.MessageCreate;
export async function execute(message: Message) {
	// Ignore direct messages and own messages
	if (!message.inGuild() || message.author.id === message.client.user.id) return;
	const { guildId } = message;

	// Split message content into words
	const words = message.content
		.toLowerCase()
		.split(/\s+/)
		.flatMap((word) => {
			const without = word.replace(/[^\w\s]/g, '');
			return without === word ? word : [word, without];
		})
		// Deduplicate word list
		.filter((word, idx, arr) => arr.indexOf(word) === idx);

	// Get appropriate responses matching all mentioned keywords
	const dbResponses = await db
		.select({ message: responses.message, name: responses.name })
		.from(responses)
		.innerJoin(keywords, and(eq(keywords.id, responses.keyword)))
		.where(and(eq(keywords.guild, guildId), inArray(keywords.word, words)));

	// Also check for keyword-linked reactions
	const dbReactions = await db
		.select({ emoji: reactions.emoji })
		.from(keywordReactions)
		.innerJoin(keywords, eq(keywords.id, keywordReactions.keyword))
		.innerJoin(reactions, eq(reactions.id, keywordReactions.reaction))
		.where(and(eq(keywords.guild, guildId), inArray(keywords.word, words)));

	// Aggregate all possibilities and pick one at random
	const aggregate = [...dbResponses, ...dbReactions];
	if (aggregate.length === EMPTY) return;
	const choice = aggregate[Math.floor(Math.random() * aggregate.length)]!;

	// React with emoji to message in response to mention
	if ('emoji' in choice) {
		await message.react(choice.emoji);

		logger.info(`Reacted to keyword with '${choice.emoji}' in guild with ID '${guildId}'.`, {
			label: 'EVENT'
		});
		return;
	}

	// Otherwise reply with a direct response:
	if (!('message' in choice)) throw new Error('Unexpected state in keyword mention choices!');

	await message.reply({
		content: choice.message,
		allowedMentions: {
			repliedUser: false
		}
	});

	logger.info(
		`Responded to keyword with '${choice.name}' in guild with ID '${message.guild.id}'.`,
		{ label: 'EVENT' }
	);
}
