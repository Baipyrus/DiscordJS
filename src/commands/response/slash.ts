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
import { guilds, keywords, responses } from '$lib/db/schema.js';
import { EMPTY } from '$lib/constants.js';
import { db } from '$lib/db/index.js';
import { and, eq } from 'drizzle-orm';
import { logger } from '$lib/Logger.js';

async function createResponse(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('keyword');

	// Abort if keyword already exists or is empty
	const found = await db
		.select()
		.from(keywords)
		.where(and(eq(keywords.guild, interaction.guildId!), eq(keywords.word, keyword ?? '')));

	// Reply with error
	if (found.length > EMPTY || !keyword) {
		await interaction.reply({
			content: 'Invalid parameters or keyword already exists!',
			ephemeral: true
		});
		return;
	}

	// Create guild if not exists
	await db.insert(guilds).values({ id: interaction.guildId! }).onConflictDoNothing();

	// Create new keyword entry
	await db.insert(keywords).values({ guild: interaction.guildId!, word: keyword });

	// Reply successfully to acknowledge command
	await interaction.reply({
		content: `Keyword for '${keyword}' successfully created!`,
		ephemeral: true
	});

	logger.info(`Keyword for '${keyword}' successfully created.`, { label: 'CMD' });
}

async function addResponse(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	// Get command options
	const current = options.getString('keyword');

	// Abort if keyword doesn't exist
	const found = await db
		.select()
		.from(keywords)
		.where(and(eq(keywords.guild, interaction.guildId!), eq(keywords.word, current ?? '')));

	// Reply with error
	if (found.length === EMPTY) {
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
			.setValue(current ?? '')
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

	// The following error is nonsensical because it works fine in plain JavaScript.
	// Besides that, we also ignore it for now because this old API is deprecated anyways.
	// @ts-ignore 2345
	modal.addComponents(keyword, name, response);

	await interaction.showModal(modal);
}

async function removeKeyword(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('name');

	// Try deleting keyword from database
	await db
		.delete(keywords)
		.where(and(eq(keywords.guild, interaction.guildId!), eq(keywords.word, keyword ?? '')));

	// Reply with success
	await interaction.reply({
		content: `Keyword '${keyword}' was successfully deleted!`,
		ephemeral: true
	});
}

async function removeResponse(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('keyword');
	const name = options.getString('name');

	// Find keyword in database
	const found = await db
		.select()
		.from(keywords)
		.where(and(eq(keywords.guild, interaction.guildId!), eq(keywords.word, keyword ?? '')))
		.limit(1);

	// Abort if keyword not found
	if (found.length === EMPTY) {
		await interaction.reply({
			content: 'Unknown keyword was specified!',
			ephemeral: true
		});
		return;
	}

	// Try deleting response from database
	await db
		.delete(responses)
		.where(and(eq(responses.keyword, found[0]!.id), eq(responses.name, name ?? '')));

	// Reply with success
	await interaction.reply({
		content: `Response with name '${name}' was successfully deleted!`,
		ephemeral: true
	});
}

async function listResponse(interaction: ChatInputCommandInteraction) {
	// Get list of keywords from database
	const found = await db.select().from(keywords).where(eq(keywords.guild, interaction.guildId!));

	// Abort if no keywords registered
	if (found.length === EMPTY) {
		await interaction.reply({
			content: 'No keywords have been registered yet!',
			ephemeral: true
		});
		return;
	}

	// Join list of keyword names
	const joined = found.map((keyword) => keyword.word).join('\n- ');

	// Reply with list of keywords
	await interaction.reply({
		content: `List of known keywords:\n- ${joined}`,
		ephemeral: true
	});
}

async function responseInfos(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('keyword');
	const name = options.getString('name');

	// Find keyword in database
	const found = await db
		.select()
		.from(keywords)
		.where(and(eq(keywords.guild, interaction.guildId!), eq(keywords.word, keyword ?? '')))
		.limit(1);

	// Abort if keyword not found
	if (found.length === EMPTY) {
		await interaction.reply({
			content: 'Unknown keyword was specified!',
			ephemeral: true
		});
		return;
	}

	// Find response in database
	const response = await db
		.select()
		.from(responses)
		.where(and(eq(responses.keyword, found[0]!.id), eq(responses.name, name ?? '')));

	// Abort if response not found
	if (response.length === EMPTY) {
		await interaction.reply({
			content: 'Unknown response was specified!',
			ephemeral: true
		});
		return;
	}

	// Reply with success
	await interaction.reply({
		content: `Response with name '${name}' has data of \`${response[0]!.message}\`!`,
		ephemeral: true
	});
}

async function keywordInfos(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	// Get command options
	const keyword = options.getString('name');

	// Get list of responses from database
	const results = await db
		.select()
		.from(responses)
		.where(
			eq(
				responses.keyword,
				db
					.select({ id: keywords.id })
					.from(keywords)
					.where(and(eq(keywords.guild, interaction.guildId!), eq(keywords.word, keyword ?? '')))
			)
		);

	// Abort if no responses registered
	if (results.length === EMPTY) {
		await interaction.reply({
			content: 'No responses have been registered yet or invalid keyword was supplied!',
			ephemeral: true
		});
		return;
	}

	// Join list of responses
	const joined = results.map((response) => response.name).join('\n- ');

	// Reply with list of responses
	await interaction.reply({
		content: `List of responses for ${keyword}:\n- ${joined}`,
		ephemeral: true
	});
}

async function keywordAutocomplete(interaction: AutocompleteInteraction, focused?: string) {
	const { options, guildId } = interaction;

	// Get command options
	if (!focused) focused = options.getFocused();

	// Get list of keywords from database
	const found = await db.select().from(keywords).where(eq(keywords.guild, guildId!));

	// Filter total list of keywords
	const filtered = found.filter((choice) => choice.word.startsWith(focused));

	// Respond with possible suggestions
	await interaction.respond(filtered.map((choice) => ({ name: choice.word, value: choice.word })));
}

async function completeResponses(interaction: AutocompleteInteraction, focused: string) {
	const { options, guildId } = interaction;

	// Get command options
	const keyword = options.getString('keyword');

	// Get list of responses from database
	const results = await db
		.select()
		.from(responses)
		.where(
			eq(
				responses.keyword,
				db
					.select({ id: keywords.id })
					.from(keywords)
					.where(and(eq(keywords.guild, guildId!), eq(keywords.word, keyword ?? '')))
			)
		);

	// Filter total list of responses
	const filtered = results.filter((choice) => choice.name.startsWith(focused));

	// Respond with possible suggestions
	await interaction.respond(filtered.map((choice) => ({ name: choice.name, value: choice.name })));
}

async function responseAutocomplete(interaction: AutocompleteInteraction) {
	const { options } = interaction;

	// Get command options
	const focused = options.getFocused(true);
	const { name, value } = focused;
	switch (name) {
		case 'keyword':
			await keywordAutocomplete(interaction, value);
			break;
		case 'name':
			await completeResponses(interaction, value);
			break;
		default:
			throw new Error('Unexpected user subcommand option!');
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
	.addSubcommandGroup((group) =>
		group
			.setName('remove')
			.setDescription('Unregisters a response or a keyword.')
			.addSubcommand((subcommand) =>
				subcommand
					.setName('keyword')
					.setDescription('Deletes a keyword completely.')
					.addStringOption((option) =>
						option
							.setName('name')
							.setDescription('The keyword to be deleted.')
							.setAutocomplete(true)
							.setRequired(true)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName('response')
					.setDescription('Unregisters a response of a keyword.')
					.addStringOption((option) =>
						option
							.setName('keyword')
							.setDescription('The keyword that would trigger the response.')
							.setAutocomplete(true)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName('name')
							.setDescription('The name of the data to be removed.')
							.setAutocomplete(true)
							.setRequired(true)
					)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand.setName('list').setDescription('Lists all registered keywords.')
	)
	.addSubcommandGroup((group) =>
		group
			.setName('info')
			.setDescription('Lists information about a response or a keyword.')
			.addSubcommand((subcommand) =>
				subcommand
					.setName('keyword')
					.setDescription('Lists registered responses of a keyword.')
					.addStringOption((option) =>
						option
							.setName('name')
							.setDescription('The keyword to be shown the details of.')
							.setAutocomplete(true)
							.setRequired(true)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName('response')
					.setDescription('Lists the data being sent by a response.')
					.addStringOption((option) =>
						option
							.setName('keyword')
							.setDescription('The keyword that would trigger the response.')
							.setAutocomplete(true)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName('name')
							.setDescription('The name of the data to be listed.')
							.setAutocomplete(true)
							.setRequired(true)
					)
			)
	);

export async function modalSubmit(interaction: ModalSubmitInteraction) {
	const { fields, guildId } = interaction;

	// Get text inputs from modal
	const keyword = fields.getTextInputValue('keyword');
	const message = fields.getTextInputValue('response');
	const name = fields.getTextInputValue('name').toLowerCase();

	// Get id of keyword
	const found = await db
		.select()
		.from(keywords)
		.where(and(eq(keywords.guild, guildId!), eq(keywords.word, keyword)));

	// Abort if response exists
	if (
		found.length > EMPTY &&
		(
			await db
				.select()
				.from(responses)
				.where(and(eq(responses.keyword, found[0]!.id), eq(responses.name, name)))
		).length > EMPTY
	) {
		await interaction.reply({
			content: `Response with name '${name}' already exists!`,
			ephemeral: true
		});
		return;
	} else if (found.length === EMPTY) {
		await interaction.reply({
			content: `Keyword '${keyword}' does not yet exist!`,
			ephemeral: true
		});
		return;
	}

	// Create new response data with keyword attached
	await db.insert(responses).values({ keyword: found[0]!.id, name, message });

	// Reply with success
	await interaction.reply({
		content: `Successfully registered '${name}' as response to '${keyword}'!`,
		ephemeral: true
	});
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const { options } = interaction;

	const command = options.getSubcommand();
	const group = options.getSubcommandGroup();
	const jointStr = group === null ? command : `${group} ${command}`;

	switch (jointStr) {
		case 'info keyword':
		case 'remove keyword':
			await keywordAutocomplete(interaction);
			break;
		case 'info response':
		case 'remove response':
			await responseAutocomplete(interaction);
			break;
		case 'add':
			keywordAutocomplete(interaction);
			break;
		default:
			throw new Error('Unexpected user subcommand!');
	}
}

export function execute(interaction: ChatInputCommandInteraction) {
	const { options } = interaction;

	const command = options.getSubcommand();
	const group = options.getSubcommandGroup();
	const jointStr = group === null ? command : `${group} ${command}`;

	switch (jointStr) {
		case 'create':
			createResponse(interaction);
			break;
		case 'add':
			addResponse(interaction);
			break;
		case 'remove keyword':
			removeKeyword(interaction);
			break;
		case 'remove response':
			removeResponse(interaction);
			break;
		case 'list':
			listResponse(interaction);
			break;
		case 'info keyword':
			keywordInfos(interaction);
			break;
		case 'info response':
			responseInfos(interaction);
			break;
		default:
			throw new Error('Unexpected user subcommand!');
	}
}
