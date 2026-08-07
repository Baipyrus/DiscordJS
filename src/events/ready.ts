import { Events } from 'discord.js';
import { consoleTransport, logger } from '$lib/Logger.js';
import type { ModifiedClient } from '$lib/Client.js';

export const name = Events.ClientReady;
export const once = true;
export function execute(client: ModifiedClient) {
	// Temporarily allow logging to console to give startup feedback
	const isDevMode = process.env['NODE_ENV'] === 'development';
	if (!isDevMode) logger.add(consoleTransport);
	logger.info(`Ready! Logged in as ${client.user!.tag}`, { label: 'STARTUP' });
	if (!isDevMode) logger.remove(consoleTransport);
}
