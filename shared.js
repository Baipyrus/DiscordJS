import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Role } from 'discord.js';
import { Messages, RoleEmojiPairs, Guilds } from './database.js';
import { readdir } from 'fs/promises';
import { config } from 'dotenv';
import { Op } from 'sequelize';
import { join } from 'path';
import Module from 'module';

config();

/**
 * Main logic of the different 'Self Roles remove' commands to remove the functionality from a `Message`.
 * @param {(ChatInputCommandInteraction|ContextMenuCommandInteraction)} interaction The interaction related to this command.
 * @param {string} id A Discord message ID.
 */
export const removeSelfRoles = async (interaction, id) => {
	// Try deleting message from database
	const count = await Messages.destroy({
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

/**
 * Function to handle saving all the corresponding data for `Messages` and `RoleEmojiPairs` tables.
 * @param {string} id A Discord message ID.
 * @param {Role} role
 * @param {string} emoji Either a unicode emoji or a string representation in Discord custom emoji format.
 */
const saveMessageData = async (id, role, emoji) => {
	// Try finding message
	const msg = await Messages.findOne({ where: { id } });
	if (msg === null) throw new Error(`No message with ID '${id}' could be found!`);

	// Try finding existing entry
	const rep = await RoleEmojiPairs.findOne({
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

	// Create guild if not exists
	const guildData = { id: role.guild.id };
	await Guilds.findOrCreate({
		where: guildData,
		defaults: guildData
	});

	// Create database entry for pair
	await RoleEmojiPairs.create({
		message: id,
		role: role.id,
		guild: guildData.id,
		emoji: emoji.replace(/:(\s*[^:]*\s*):/, ':_:')
	});
};

/**
 * Function to handle editing messages in case the message that's getting a new `RoleEmojiPair`, is owned by the bot.
 * @param {import('discord.js').Message} message
 * @param {Role} role
 * @param {string} emoji Either a unicode emoji or a string representation in Discord custom emoji format.
 */
const editMessage = async (message, role, emoji) => {
	if (message.author.id !== process.env.CLIENT) return;

	// Find out whether to pad message or already present
	let padding = '\n';
	const reps = await RoleEmojiPairs.findAll({ where: { message: message.id } });
	if (reps.length === 0) padding += '\n';

	// Get old and build new content of message
	const current = message.content;
	const next = current + padding + `React with ${emoji} to receive <@&${role.id}>!`;

	// Set message by editing
	await message.edit(next);
};

/**
 * Main logic of the different 'Self Roles add' commands to add a `RoleEmojiPair` to the database and the `Message`.
 * @param {(ChatInputCommandInteraction|ContextMenuCommandInteraction)} interaction The interaction related to this command.
 * @param {string} msgID A Discord message ID.
 * @param {Role} role
 * @param {string} emoji Either a unicode emoji or a string representation in Discord custom emoji format.
 */
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

// Lists of required and optional attributes of command modules
const required = ['data', 'execute'];
const optional = ['autocomplete', 'modalSubmit'];

/**
 * Recursively scans a directory for all files in it.
 * @param {string} dir
 * @returns {Promise<Array<string>>} Array of paths to the files within.
 */
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

/**
 * Imports and checks a command from a path as a module.
 * @param {string} filePath
 * @returns {Promise<Module|0>}
 */
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
