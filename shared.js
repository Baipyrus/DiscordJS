import { join } from 'path';
import { Op } from 'sequelize';
import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { Message, RoleEmojiPair } from './database.js';

config();

export const removeSelfRoles = async (interaction, id) => {
	// Try deleting message from database
	const count = await Message.destroy({
		where: {
			id: id
		}
	});

	// Set reply based on result of deletion
	let response = 'Successfully removed';
	if (count === 0) response = 'Failed to remove';

	// Reply to acknowledge command
	await interaction.reply({
		content: `${response} self roles from message!`,
		ephemeral: true
	});

	console.info(`[INFO] Removed self roles from message with ID '${id}'.`);
};

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
				},
				{
					message: id,
					emoji
				}
			]
		}
	});
	if (rep !== null)
		throw new Error(
			`Existing RoleEmojiPair entry with (partial) data {message:${id},role:${role.id},emoji:${emoji}}!`
		);

	// Create database entry for pair
	await RoleEmojiPair.create({ message: id, role: role.id, emoji });
};

const editMessage = async (message, role, emoji) => {
	if (message.author.id !== process.env.CLIENT) return;

	// Find out whether to pad message or already present
	let padding = '\n';
	const reps = await RoleEmojiPair.findAll({ where: { message: message.id } });
	if (reps.length === 0) padding += '\n';

	// Get old and build new content of message
	const current = message.content;
	const next = current + padding +
		`React with ${emoji} to receive <@&${role.id}>!`;

	// Set message by editing
	await message.edit(next);
};

export const addSelfRoles = async (interaction, msgID, role, emoji) => {
	const { channel } = interaction;

	let step = 'fetch';
	try {
		// Get message by id
		const message = await channel.messages.fetch(msgID);

		step = 'edit';
		// Try editing message to explain pair
		await editMessage(message, role, emoji);

		step = 'save data from';
		await saveMessageData(msgID, role, emoji);

		step = 'react to';
		// React with emoji to message
		await message.react(emoji);

		// Reply successfully to acknowledge command
		await interaction.reply({
			content: 'Added new entry for self roles!',
			ephemeral: true
		});

		console.info(`[INFO] Added new entry to get role with ID '${role.id}' using '${emoji}'.`);
	} catch (error) {
		console.error(error);

		// Reply failed to acknowledge command
		await interaction.reply({
			content: `Failed to ${step} message!`,
			ephemeral: true
		});
	}
};

const required = ['data', 'execute'];
const optional = ['autocomplete', 'modalSubmit'];

export const getFiles = async (dir) => {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = join(dir, dirent.name);
			return dirent.isDirectory() ? getFiles(res) : res;
		})
	);
	return Array.prototype.concat(...files);
};

export const importAndCheck = async (filePath) => {
	if (!filePath.endsWith('.js') || filePath.endsWith('.example.js')) {
		// Skip this file
		return 0;
	}
	const command = await import(filePath);
	// Warn incomplete commands
	if (!required.every((name) => name in command)) {
		console.error(
			`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`
		);
		return 0;
	}
	const properties = optional.filter((name) => !(name in command));
	if (properties.length > 0)
		properties.forEach((name) =>
			console.warn(
				`[WARNING] The command at ${filePath} is missing an optional "${name}" property.`
			)
		);
	// Add command to collection
	return command;
};
