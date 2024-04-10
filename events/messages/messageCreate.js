import { Keywords, Responses, sequelize } from '../../database.js';
import { Events, Message } from 'discord.js';
import { Op } from 'sequelize';

export const name = Events.MessageCreate;
/** @param {Message} message */
export async function execute(message) {
	// Ignore direct messages and own messages
	if (!message.inGuild() || message.author.id === process.env.CLIENT) return;

	// Split message content into words
	const words = message.content.toLowerCase().split(/\s+/);

	// Get guild keywords
	/** @type {import('../../models/keywords.js').Keyword[]} */
	const keywords = await Keywords.findAll({
		where: {
			guild: message.guildId,
			name: {
				[Op.in]: words
			}
		}
	});

	// Ignore if no keywords found
	if (keywords.length === 0) return;

	// Get guild responses
	/** @type {import('../../models/responses.js').Response|null} */
	const response = await Responses.findOne({
		where: {
			keyword: {
				[Op.in]: keywords.map((keyword) => keyword.id)
			}
		},
		order: sequelize.random()
	});

	// Ignore if no response found
	if (response.length === null) return;

	// Send response, selecting exactly one at random
	await message.reply({
		content: response.response,
		allowedMentions: {
			repliedUser: false
		}
	});

	console.info(
		`[INFO] Responded to keyword with '${response.name}' in guild with ID '${message.guild.id}'.`
	);
}
