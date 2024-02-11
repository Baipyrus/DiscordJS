import { Events } from 'discord.js';
import Module from 'module';

/**
 * A more precise execution function specifically to call the main property of a module.
 * @param {import('discord.js').Interaction} interaction
 * @param {Module} command
 */
const executeCommand = async (interaction, command) => {
	// Try executing command
	try {
		console.info(`[INFO] Command ${interaction.commandName} was executed.`);
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		// Follow up/reply with error message
		if (interaction.replied || interaction.deferred)
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true
			});
		else
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true
			});
	}
};

/**
 * A generic execution function to call command methods.
 * @param {import('discord.js').Interaction} interaction
 * @param {Module} command
 * @param {string} name
 * @param {string=} description
 * @param {string=} cmdName
 */
const genericExecute = async (interaction, command, name, description, cmdName) => {
	try {
		console.info(
			`[INFO] Command ${cmdName ?? interaction.commandName ?? 'anonymous'} ${
				description ?? `used "${name}"`
			}.`
		);
		await command[name](interaction);
	} catch (error) {
		console.error(error);
	}
};

export const name = Events.InteractionCreate;
/** @param {import('discord.js').Interaction} interaction */
export async function execute(interaction) {
	/** @type {Module} */
	let command = interaction.client.commands.get(interaction.commandName);

	// Execute slash- and context-menu-commands
	if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
		await executeCommand(interaction, command);
		return;
	}
	// Autocomplete input
	if (interaction.isAutocomplete() && 'autocomplete' in command) {
		await genericExecute(interaction, command, 'autocomplete');
		return;
	}
	// Modal submit event
	if (interaction.isModalSubmit()) {
		const name = interaction.customId.split('-')[0];
		command = interaction.client.commands.get(name);

		await genericExecute(interaction, command, 'modalSubmit', 'submitted a modal', name);
		return;
	}

	// Check if command exists
	if (interaction.commandName && !command) {
		console.warn(`[WARNING] No command matching ${interaction.commandName} was found.`);
		return;
	}
}
