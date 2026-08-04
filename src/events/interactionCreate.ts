import type { ModifiedClient } from '$lib/Client.js';
import { logger, unknownErrorLogger } from '$lib/Logger.js';
import type { CommandModule } from '$lib/modules.js';
import {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	Events,
	type Interaction
} from 'discord.js';

// A more precise execution function specifically to call the main property of a module.
const executeCommand = async (
	interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
	command: CommandModule
) => {
	// Try executing command
	try {
		logger.info(`Command '${interaction.commandName}' was executed.`, { label: 'INTERACTION' });

		await command.execute(interaction);
	} catch (error) {
		unknownErrorLogger(error, 'INTERACTION');

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

// A generic execution function to call command methods.
const genericExecute = async (
	interaction: Interaction,
	command: CommandModule,
	name: string,
	description?: string,
	cmdName?: string
) => {
	try {
		logger.info(
			// @ts-ignore 2339 Ignore use undefined property 'commandName'
			`Command '${cmdName ?? interaction.commandName ?? 'anonymous'}' ${
				description ?? `used "${name}"`
			}.`,
			{ label: 'INTERACTION' }
		);

		// @ts-ignore 7053 Ignore one time use of this implicite object syntax
		await command[name](interaction);
	} catch (error) {
		unknownErrorLogger(error, 'INTERACTION');
	}
};

export const name = Events.InteractionCreate;
export async function execute(interaction: Interaction & { client: ModifiedClient }) {
	// @ts-ignore 2339 Ignore use undefined property 'commandName'
	const { commandName } = interaction;
	let command = interaction.client.commands.get(commandName);

	// Execute slash- and context-menu-commands
	if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
		// If is ChatInputCommandInteraction, command must have been found.
		await executeCommand(interaction, command!);
		return;
	}

	// Autocomplete input
	if (interaction.isAutocomplete() && 'autocomplete' in command!) {
		// If is AutocompleteInteraction, command is currently selected for.
		await genericExecute(interaction, command, 'autocomplete');
		return;
	}

	// Modal submit event
	if (interaction.isModalSubmit()) {
		// If is ModalSubmitInteraction, command has already been executed once.
		const name = interaction.customId.split('-')[0]!;
		command = interaction.client.commands.get(name);

		await genericExecute(interaction, command!, 'modalSubmit', 'submitted a modal', name);
		return;
	}

	// Check if command exists and log usage of unknown name
	if (commandName && !command)
		console.warn(`[WARNING] No command matching ${commandName} was found.`);
}
