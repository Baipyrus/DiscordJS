import { Events } from 'discord.js';
import { logger } from '$lib/Logger.js';
import type { ModifiedClient } from '$lib/Client.js';

export const name = Events.ClientReady;
export const once = true;
export function execute(client: ModifiedClient) {
	logger.info(`Ready! Logged in as ${client.user!.tag}`, { label: 'STARTUP' });
}
