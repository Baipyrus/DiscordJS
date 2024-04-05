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
async function createResponse(interaction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('keyword');

	// Abort if keyword already exists or is empty
	/** @type {import('../../models/keywords.js').Keyword|null} */
	const found = await Keywords.findOne({
		where: {
			guild: interaction.guildId,
			name: keyword
		}
	});

	// Reply with error
	if (found !== null || !keyword) {
		await interaction.reply({
			content: 'Invalid parameters or keyword already exists!',
			ephemeral: true
		});
		return;
	}

	// Create guild if not exists
	const guildData = { id: interaction.guildId };
	await Guilds.findOrCreate({
		where: guildData,
		defaults: guildData
	});

	// Create new keyword
	await Keywords.create({
		guild: interaction.guildId,
		name: keyword
	});

	// Reply successfully to acknowledge command
	await interaction.reply({
		content: `Keyword for '${keyword}' successfully created!`,
		ephemeral: true
	});

	console.info(`[INFO] Keyword for '${keyword}' successfully created.`);
}

/** @param {ChatInputCommandInteraction} interaction */
async function addResponse(interaction) {
	const { options } = interaction;

	// Get command options
	const current = options.getString('keyword');

	// Abort if keyword doesn't exist
	/** @type {import('../../models/keywords.js').Keyword|null} */
	const found = await Keywords.findOne({
		where: {
			guild: interaction.guildId,
			name: current
		}
	});

	// Reply with error
	if (found === null) {
		await interaction.reply({
			content: 'Keyword has not been registered yet!',
			ephemeral: true
		});
		return;
	}

	const modal = new ModalBuilder().setCustomId('response-pair').setTitle('Response Content');

	const keyword = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('The keyword this command is run for.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('keyword')
			.setRequired(true)
			.setValue(current)
	);

	const name = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('The name of the response.')
			.setStyle(TextInputStyle.Short)
			.setCustomId('name')
			.setRequired(true)
	);

	const response = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setLabel('The data to respond with.')
			.setStyle(TextInputStyle.Paragraph)
			.setCustomId('response')
			.setRequired(true)
	);

	modal.addComponents(keyword, name, response);

	await interaction.showModal(modal);
}

/** @param {ChatInputCommandInteraction} interaction */
async function removeResponse(interaction) {
	const { options } = interaction;

	// Get command options
	/** @type {'keyword'|'response'} */
	const type = options.getString('type');
	const name = options.getString('name');

	switch (type) {
		case 'keyword':
			// Try removing keyword
			await Keywords.destroy({
				where: {
					guild: interaction.guildId,
					name
				}
			});
			break;
		case 'response':
			// Try removing response
			await Responses.destroy({
				where: {
					guild: interaction.guildId,
					name
				}
			});
	}
}

/** @param {ChatInputCommandInteraction} interaction */
async function listResponse(interaction) {
	// Get list of keywords from database
	/** @type {import('../../models/keywords.js').Keyword[]} */
	const keywords = await Keywords.findAll({
		where: {
			guild: interaction.guildId
		}
	});

	// Abort if no keywords registered
	if (keywords.length === 0) {
		await interaction.reply({
			content: 'No keywords have been registered yet!',
			ephemeral: true
		});
		return;
	}

	// Join list of keyword names
	const joined = keywords.map((keyword) => keyword.name).join('\n- ');

	// Reply with list of keywords
	await interaction.reply({
		content: `List of known keywords:\n- ${joined}`,
		ephemeral: true
	});
}

/** @param {ChatInputCommandInteraction} interaction */
async function infoResponse(interaction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('keyword');

	// Find keyword in database
	/** @type {import('../../models/keywords.js').Keyword|null} */
	const found = await Keywords.findOne({
		where: {
			guild: interaction.guildId,
			name: keyword
		}
	});

	// Abort if keyword not found
	if (found === null) {
		await interaction.reply({
			content: 'Unknown keyword was specified!',
			ephemeral: true
		});
		return;
	}

	// Get list of responses from database
	/** @type {import('../../models/responses.js').Response[]} */
	const responses = await Responses.findAll({
		where: {
			keyword: found.id
		}
	});

	// Abort if no responses registered
	if (responses.length === 0) {
		await interaction.reply({
			content: 'No responses have been registered yet!',
			ephemeral: true
		});
		return;
	}

	// Join list of responses
	const joined = responses.map((response) => response.name).join('\n- ');

	// Reply with list of responses
	await interaction.reply({
		content: `List of responses for ${keyword}:\n- ${joined}`,
		ephemeral: true
	});
}

/** @param {AutocompleteInteraction} interaction */
async function keywordAutocomplete(interaction) {
	const { options, guildId } = interaction;

	// Get command options
	const focused = options.getFocused();

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
async function responseAutocomplete(interaction) {
	const { options, guildId } = interaction;

	// Get command options
	const keyword = options.getString('keyword');
	const focused = options.getFocused();

	// Get keyword
	/** @type {import('../../models/keywords.js').Keyword} */
	const found = await Keywords.findOne({
		where: {
			guild: guildId,
			name: keyword
		}
	});

	// Get list of responses from database
	/** @type {import('../../models/responses.js').Response[]} */
	const responses =
		found === null
			? []
			: await Responses.findAll({
					where: {
						guild: guildId,
						keyword: found.id
					}
				});

	// Filter total list of responses
	const filtered = responses.filter((choice) => choice.name.startsWith(focused));

	// Respond with possible suggestions
	await interaction.respond(
		filtered.map((choice) => ({ name: choice.name, value: choice.response }))
	);
}

/** @param {AutocompleteInteraction} interaction */
async function removeAutocomplete(interaction) {
	const { options } = interaction;

	const type = options.getString('type');

	switch (type) {
		case 'keyword':
			await keywordAutocomplete(interaction);
			break;
		case 'response':
			await responseAutocomplete(interaction);
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
	const { fields } = interaction;

	// Get text inputs from modal
	const name = fields.getTextInputValue('name');
	const keyword = fields.getTextInputValue('keyword');
	const response = fields.getTextInputValue('response');

	// Get id of keyword
	/** @type {import('../../models/keywords.js').Keyword} */
	const found = await Keywords.findOne({
		where: {
			name: keyword
		}
	});

	// Create new response data with keyword attached
	await Responses.create({ keyword: found.id, name, response });
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
			keywordAutocomplete(interaction);
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
