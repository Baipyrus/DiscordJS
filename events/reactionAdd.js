import { Events } from 'discord.js';
import { config } from 'dotenv';
config();

export const name = Events.MessageReactionAdd;
export async function execute(reaction, user) {
	if (user.id === process.env.CLIENT) return;
	const uname = user.username;
	const rname = reaction._emoji.name;
	console.debug(`[DEBUG] User '${uname}' reacted with emoji '${rname}'.`);
}
