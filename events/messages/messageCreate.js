import { Keywords, Responses, sequelize } from '../../database.js';
import { Events, Message } from 'discord.js';
import { Op } from 'sequelize';

export const name = Events.MessageCreate;
/** @param {Message} message */
export async function execute(message) {
	// Ignore direct messages
	if (!message.inGuild()) return;

	// Split message content into words
	const words = message.content.split(/\s+/);
}
