import { Reaction } from '$lib/db/schema.js';
import { logger } from '$lib/Logger.js';
import { Events, type MessageReaction, type User } from 'discord.js';

export const name = Events.MessageReactionRemove;
export async function execute(reaction: MessageReaction, user: User) {
	// Ignore direct messages and own reactions
	if (!reaction.message.inGuild() || user.id === user.client.user.id) return;
	const dbReaction = new Reaction(reaction);

	// Try fetching reaction if is partial to reliably detect conditions
	if (reaction.partial)
		try {
			await reaction.fetch();
		} catch {
			logger.error(`Failed to fetch reaction on removal in guild with ID '${dbReaction.guild}'!`, {
				label: 'EVENT'
			});
			return;
		}

	// NOTE: `reaction.me` appears to be unreliable, possibly because of the partial event
	const users = await reaction.users.fetch();
	if (!users.has(user.client.user.id)) return;

	// If the bot reaction is the only one left, remove it
	const lastReactionRemaining = 1;
	if (reaction.count === lastReactionRemaining) reaction.remove();

	logger.info(
		`Removed copied reaction of '${dbReaction.emoji}' from guild with ID '${dbReaction.guild}'.`,
		{ label: 'EVENT' }
	);
}
