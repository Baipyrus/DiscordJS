import { config } from 'dotenv';
import { Events } from 'discord.js';
import { Message, RoleEmojiPair } from '../database.js';
config();

export const name = Events.MessageReactionRemove;
export async function execute(reaction, user) {
	if (user.id === process.env.CLIENT) return;

	// Get message
	const msgID = reaction.message.id;
	const message = await Message.findOne({
		where: {
			id: msgID,
		}
	});
	// Ignore if unregistered
	if (message === null) return;

	// Get emoji
	const emoji = reaction.emoji.toString();
	const rep = await RoleEmojiPair.findOne({
		where: {
			message: msgID,
			emoji,
		}
	});
	// Deny if unregistered
	if (rep === null) return;

	// Fetch role from guild
	const guild = reaction.message.guild;
	const role = await guild.roles.fetch(rep.role);
	if (role === null) return;

	// Add role to user
	await guild.members.removeRole({ role, user });
	console.info(`[INFO] Removed role with id '${role.id}' from user '${user.username}'.`);
}
