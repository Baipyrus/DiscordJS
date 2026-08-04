import { Events, Client } from 'discord.js';
import { logger } from 'lib/Logger.js';

export const name = Events.ClientReady;
export const once = true;
export function execute(client: Client) {
	logger.info(`Ready! Logged in as ${client.user!.tag}`, { label: 'STARTUP' });
}
