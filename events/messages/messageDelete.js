import { Events } from 'discord.js';
import { Message } from '../../database.js';

export const name = Events.MessageDelete;
export async function execute(message) {
	// Delete message entry once message is deleted itself
	const count = await Message.destroy({
		where: {
			id: message.id
		}
	});
	if (count > 0) console.info(`[INFO] Reaction Roles Message with ID '${message.id}' was deleted.`);
}
