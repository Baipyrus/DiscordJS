import { keywords, responses } from 'lib/db/schema.js';
import { Events, Message } from 'discord.js';
import { EMPTY } from 'lib/constants.js';
import { db } from 'lib/db/index.js';
import { and, eq, inArray } from 'drizzle-orm';
import { logger } from 'lib/Logger.js';

export const name = Events.MessageCreate;
export async function execute(message: Message) {
	// Ignore direct messages and own messages
	if (!message.inGuild() || message.author.id === message.client.user.id) return;

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

	// Get appropriate reponses matching all mentioned keywords
	const results = await db
		.select()
		.from(responses)
		.where(
			inArray(
				responses.keyword,
				db
					.select({ id: keywords.id })
					.from(keywords)
					.where(and(eq(keywords.guild, message.guildId), inArray(keywords.word, words)))
			)
		);

	// Ignore if no keywords with appropriate response were found
	if (results.length === EMPTY) return;
	const response = results[Math.floor(Math.random() * results.length)]!;

	// Send response, selecting exactly one at random
	await message.reply({
		content: response.message,
		allowedMentions: {
			repliedUser: false
		}
	});

	logger.info(
		`Responded to keyword with '${response.name}' in guild with ID '${message.guild.id}'.`,
		{ label: 'EVENT' }
	);
}
