import { Events, MessageReaction, User } from 'discord.js';
import { Message, RoleEmojiPair } from '../../database.js';
import { config } from 'dotenv';

config();

export const name = Events.MessageReactionAdd;
/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
export async function execute(reaction, user) {
	if (user.id === process.env.CLIENT) return;

	// Get message
	const msgID = reaction.message.id;
	const message = await Message.findOne({
		where: {
			id: msgID
		}
	});
	// Ignore if unregistered
	if (message === null) return;

	// Get emoji
	const emoji = reaction.emoji.toString();
	const rep = await RoleEmojiPair.findOne({
		where: {
			message: msgID,
			emoji
		}
	});
	// Deny if unregistered
	if (rep === null) {
		// Remove reaction and quit
		try {
			reaction.remove();
		} catch (error) {
			// Missing permissions
			console.error(error)
			await user.send('Unable to remove reaction. Please contact server staff.');
		}
		return;
	}

	// Fetch role from guild
	const guild = reaction.message.guild;
	const role = await guild.roles.fetch(rep.role);
	// Role not found
	if (role === null) {
		await user.send('Could not fetch role! Please contact server staff.');
		return;
	}

	try {
		// Add role to user
		await guild.members.addRole({ role, user });
		console.info(`[INFO] Added role with id '${role.id}' to user '${user.username}'.`);
	} catch (error) {
		// Missing permissions
		console.error(error);
		await user.send('Unable to assign role. Please contact server staff.');
	}
}
