import { Events, MessageReaction, User } from 'discord.js';
import { Messages, RoleEmojiPairs } from '../../database.js';
import { config } from 'dotenv';

config();

export const name = Events.MessageReactionRemove;
/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
export async function execute(reaction, user) {
	if (user.id === process.env.CLIENT) return;

	// Get message
	const msgID = reaction.message.id;
	/** @type {import('../../models/messages.js').Message|null} */
	const message = await Messages.findOne({
		where: {
			id: msgID
		}
	});
	// Ignore if unregistered
	if (message === null) return;

	// Get emoji
	const emoji = reaction.emoji.toString();
	/** @type {import('../../models/roleEmojiPairs.js').RoleEmojiPair|null} */
	const rep = await RoleEmojiPairs.findOne({
		where: {
			message: msgID,
			emoji
		}
	});
	// Deny if unregistered
	if (rep === null) return;

	// Fetch role from guild
	const guild = reaction.message.guild;
	const role = await guild.roles.fetch(rep.role);
	// Role not found
	if (role === null) {
		await user.send('Could not fetch role! Please contact server staff.');
		return;
	}

	try {
		// Remove role from user
		await guild.members.removeRole({ role, user });
		console.info(`[INFO] Removed role with id '${role.id}' from user '${user.username}'.`);
	} catch (error) {
		// Missing permissions
		console.error(error);
		await user.send('Unable to retract role. Please contact server staff.');
	}
}
