import { Events } from 'discord.js';

export const name = Events.MessageReactionRemove;
export async function execute(messageReaction, user) {
	console.log(messageReaction, user);
}
