import { Events } from 'discord.js';

export const name = Events.MessageReactionAdd;
export async function execute(messageReaction, user) {
	console.log(messageReaction, user);
}
