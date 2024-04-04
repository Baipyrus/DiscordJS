import {
	ModalBuilder,
	TextInputBuilder,
	ActionRowBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
	ModalSubmitInteraction,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	TextInputStyle
} from 'discord.js';
import { Guilds, Keywords, Responses } from '../../database.js';

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

/**
 * @param {string} guildId
 * @param {string} focused
 */
async function keywordAutocomplete(guildId, focused) {
	// Get list of keywords from database
	/** @type {import('../../models/keywords.js').Keyword[]} */
	const keywords = await Keywords.findAll({
		where: {
			guild: guildId
		}
	});

	// Filter total list of keywords
	const filtered = keywords.filter((choice) => choice.name.startsWith(focused));

	// Respond with possible suggestions
	await interaction.respond(filtered.map((choice) => ({ name: choice.name, value: choice.name })));
}

/** @param {AutocompleteInteraction} interaction */
async function removeAutocomplete(interaction) {
	const { options } = interaction;

	const type = options.getString('type');

	switch (type) {
		case 'keyword':
			await keywordAutocomplete(interaction.guildId, options.getFocused());
			break;
		case 'response':
			await responseAutocomplete(
				interaction.guildId,
				options.getFocused(),
				options.getString('keyword')
			);
			break;
	}
}

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
			.setDescription('Shows responses of a registered keyword.')
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
		case 'remove':
			removeAutocomplete(interaction);
			break;
		case 'add':
		case 'info':
			keywordAutocomplete(interaction.guildId, interaction.options.getFocused());
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
