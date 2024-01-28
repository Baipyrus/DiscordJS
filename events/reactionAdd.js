import { Events } from 'discord.js';

export const name = Events.MessageReactionAdd;
export async function execute(reaction, user) {
	const uname = user.username;
	const rname = reaction._emoji.name;
	console.debug(`[DEBUG] User '${uname}' reacted with emoji '${rname}'.`);
}
