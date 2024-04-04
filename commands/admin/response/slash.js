import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ModalSubmitInteraction,
	AutocompleteInteraction,
	ChatInputCommandInteraction
} from 'discord.js';

/** @param {ChatInputCommandInteraction} interaction */
async function createResponse(interaction) {}

/** @param {ChatInputCommandInteraction} interaction */
async function addResponse(interaction) {}

/** @param {ChatInputCommandInteraction} interaction */
async function removeResponse(interaction) {}

/** @param {ChatInputCommandInteraction} interaction */
async function listResponse(interaction) {}

/** @param {ChatInputCommandInteraction} interaction */
async function infoResponse(interaction) {}

/** @param {AutocompleteInteraction} interaction */
async function addAutocomplete(interaction) {}

/** @param {AutocompleteInteraction} interaction */
async function removeAutocomplete(interaction) {}

/** @param {AutocompleteInteraction} interaction */
async function infoAutocomplete(interaction) {}

export const data = new SlashCommandBuilder()
	.setName('response')
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setDescription('Event based responses to specific messages with keywords.')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('create')
			.setDescription('Creates a new event based response.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to trigger the response.')
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Registers a response to a keyword.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to trigger the response.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Unregisters a response to a keyword.')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('The type of data to be removed.')
					.setRequired(true)
					.addChoices(
						{ name: 'Keyword', value: 'keyword' },
						{ name: 'Response', value: 'response' }
					)
			)
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the data to be removed.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand.setName('list').setDescription('Lists all registered keywords.')
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('info')
			.setDescription('Shows information about a registered keyword.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to show the details of.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	);
/** @param {ModalSubmitInteraction} interaction */
export async function modalSubmit(interaction) {
	// Only executable in 'add' subcommand
}
/** @param {AutocompleteInteraction} interaction */
export async function autocomplete(interaction) {
	const { options } = interaction;

	switch (options.getSubcommand()) {
		case 'add':
			addAutocomplete(interaction);
			break;
		case 'remove':
			removeAutocomplete(interaction);
			break;
		case 'info':
			infoAutocomplete(interaction);
			break;
	}
}
/** @param {ChatInputCommandInteraction} interaction */
export async function execute(interaction) {
	const { options } = interaction;

	switch (options.getSubcommand()) {
		case 'create':
			createResponse(interaction);
			break;
		case 'add':
			addResponse(interaction);
			break;
		case 'remove':
			removeResponse(interaction);
			break;
		case 'list':
			listResponse(interaction);
			break;
		case 'info':
			infoResponse(interaction);
			break;
	}
}
