import { Events, Client } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;
/** @param {Client} client */
export function execute(client) {
	console.info(`[INFO] Ready! Logged in as ${client.user.tag}`);
}
