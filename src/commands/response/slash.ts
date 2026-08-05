import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	type ChatInputCommandInteraction,
	type AutocompleteInteraction,
	type ModalSubmitInteraction
} from 'discord.js';
import {
	findKeyword,
	findResponseWithKeyword,
	deleteResponseWithKeyword,
	responseExistsWithKeyword,
	createResponseWithKeyword
} from '$lib/kwRespCmd/queries.js';
import {
	handleKeywordAutocomplete,
	handleResponseAutocomplete
} from '$lib/kwRespCmd/autocomplete.js';
import { buildResponseModal } from '$lib/kwRespCmd/modal.js';
import { replyOrFollowUp, logkwRespCmd } from '$lib/kwRespCmd/util.js';
import { listResponses } from '$lib/kwRespCmd/util.js';

export const data = new SlashCommandBuilder()
	.setName('response')
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setDescription('Manage randomized responses for specified keyword mentions.')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a response to an existing keyword (opens modal).')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to add a response to.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove a response from a keyword.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword the response belongs to.')
					.setAutocomplete(true)
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the response to be deleted.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('list')
			.setDescription('List all responses for a keyword.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to inspect.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('info')
			.setDescription('Show all details of a single response.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword the response belongs to.')
					.setAutocomplete(true)
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the response to be displayed.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	);

async function add(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);

	const kw = await findKeyword(guildId!, keyword);
	if (!kw) return await replyOrFollowUp(interaction, 'Specified keyword does not exist!');

	const modal = buildResponseModal(keyword);
	await interaction.showModal(modal);

	await replyOrFollowUp(interaction, `Showing '/response add' modal ...`);
}

async function remove(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);
	const name = options.getString('name', true);

	const response = await findResponseWithKeyword(guildId!, keyword, name);
	if (!response) return await replyOrFollowUp(interaction, 'Specified response does not exist!');

	await deleteResponseWithKeyword(guildId!, keyword, name);
	await replyOrFollowUp(interaction, `Response '${name}' removed from '${keyword}'!`);
}

async function info(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);
	const name = options.getString('name', true);

	const response = await findResponseWithKeyword(guildId!, keyword, name);
	if (!response) return await replyOrFollowUp(interaction, 'Specified response does not exist!');

	await replyOrFollowUp(interaction, `Response '${name}': \`${response.message}\``);
}

export async function execute(interaction: ChatInputCommandInteraction) {
	logkwRespCmd(interaction, 'Response command execute');
	const subCmd = interaction.options.getSubcommand();

	switch (subCmd) {
		case 'add':
			return await add(interaction);
		case 'remove':
			return await remove(interaction);
		case 'list':
			return await listResponses(interaction);
		case 'info':
			return await info(interaction);
		default:
			throw new Error(`Unknown subcommand: ${subCmd}`);
	}
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const { options } = interaction;
	const subCmd = options.getSubcommand();
	const focused = options.getFocused(true);

	switch (focused.name) {
		case 'keyword':
			return await handleKeywordAutocomplete(interaction);
		case 'name':
			return await handleResponseAutocomplete(interaction);
		default:
			throw new Error(`Uknown subcommand option: ${subCmd} - ${focused.name}`);
	}
}

export async function modalSubmit(interaction: ModalSubmitInteraction) {
	const { guildId, fields } = interaction;
	const keyword = fields.getTextInputValue('keyword');
	const name = fields.getTextInputValue('name').toLowerCase();
	const message = fields.getTextInputValue('message');

	logkwRespCmd(interaction, 'Response modal submit');
	if (await responseExistsWithKeyword(guildId!, keyword, name))
		return await replyOrFollowUp(
			interaction,
			`Response '${name}' already exists for '${keyword}'!`
		);

	await createResponseWithKeyword(guildId!, keyword, name, message);
	await replyOrFollowUp(interaction, `Response '${name}' successfully added to '${keyword}'!`);
}
