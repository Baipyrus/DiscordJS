import { Op } from "sequelize";
import { Message, RoleEmojiPair } from "./database.js";

const saveMessageData = async (id, role, emoji) => {
	// Try finding message
	const msg = await Message.findOne({ where: { id } });
	if (msg === null) throw new Error(`No message with ID '${id}' could be found!`);

	// Try finding existing entry
	const rep = await RoleEmojiPair.findOne({
		where: {
			[Op.or]: [
				{
					message: id,
					role: role.id
				}, {
					message: id,
					emoji
				}
			]
		}
	});
	if (rep !== null) throw new Error(`Existing RoleEmojiPair entry with (partial) data {message:${id},role:${role.id},emoji:${emoji}}!`);

	// Create database entry for pair
	await RoleEmojiPair.create({ message: id, role: role.id, emoji });
};

export const addSelfRoles = async (interaction, msgID, role, emoji) => {
	const { channel } = interaction;

	let step = 'fetch';
	try {
		// Get message by id
		const message = await channel.messages.fetch(msgID);

		step = 'save data from';
		await saveMessageData(msgID, role, emoji);

		step = 'react to';
		// React with emoji to message
		await message.react(emoji);

		// Reply successfully to acknowledge command
		await interaction.reply({
			content: 'Added new entry for self roles!',
			ephemeral: true,
		});

		console.info(`[INFO] Added new entry to get role with ID '${role.id}' using '${emoji}'.`);
	} catch (error) {
		console.error(error);

		// Reply failed to acknowledge command
		await interaction.reply({
			content: `Failed to ${step} message!`,
			ephemeral: true,
		});
	}
}
