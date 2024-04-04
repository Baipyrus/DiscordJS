import { Messages } from '../../database.js';
import { Events } from 'discord.js';

export const name = Events.MessageDelete;
/** @param {import('discord.js').Message} message */
export async function execute(message) {
	// Delete message entry once message is deleted itself
	const count = await Messages.destroy({
		where: {
			id: message.id
		}
	});
	if (count > 0) console.info(`[INFO] Reaction Roles Message with ID '${message.id}' was deleted.`);
}
