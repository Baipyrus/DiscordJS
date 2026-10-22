import { ONLY_ONE_RESULT, REACTION_COPYABLE_BOOL } from '$lib/constants.js';
import { db } from '$lib/db/index.js';
import { logger } from '$lib/Logger.js';
import { Reaction, reactions } from '$models/reactions.example.js';
import { Events, type MessageReaction, type User } from 'discord.js';
import { and, eq } from 'drizzle-orm';

export const name = Events.MessageReactionAdd;
export async function execute(reaction: MessageReaction, user: User) {
	// Ignore direct messages and own messages
	if (!reaction.message.inGuild() || user.id === user.client.user.id) return;
	const dbReaction = new Reaction(reaction);

	// Try fetching reaction if is partial to reliably detect conditions
	if (reaction.partial)
		try {
			await reaction.fetch();
		} catch {
			logger.error(`Failed to fetch reaction on add in guild with ID '${dbReaction.guild}'!`, {
				label: 'EVENT'
			});
			return;
		}

	// See if reaction is registered in database and is copyable
	const result = await db
		.select()
		.from(reactions)
		.where(
			and(
				eq(reactions.guild, dbReaction.guild),
				eq(reactions.emoji, dbReaction.emoji),
				eq(reactions.isCopyable, REACTION_COPYABLE_BOOL)
			)
		)
		.limit(ONLY_ONE_RESULT);
	const found = result[0] !== undefined;

	// If reaction is registered in DB and has not reacted yet, double down
	const users = await reaction.users.fetch();
	if (!found || users.has(user.client.user.id)) return;

	await reaction.react();
	logger.info(`Copied reaction of '${dbReaction.emoji}' in guild with ID '${dbReaction.guild}'.`, {
		label: 'EVENT'
	});
}
