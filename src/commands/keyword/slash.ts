import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	type ChatInputCommandInteraction,
	type AutocompleteInteraction,
	InteractionContextType
} from 'discord.js';
import {
	findKeyword,
	keywordExists,
	createKeyword,
	deleteKeyword,
	findKeywords
} from '$lib/kwRespCmd/queries.js';
import { handleKeywordAutocomplete } from '$lib/kwRespCmd/autocomplete.js';
import { replyOrFollowUp, logkwRespCmd, listResponses } from '$lib/kwRespCmd/util.js';
import { EMPTY } from '$lib/constants.js';

export const data = new SlashCommandBuilder()
	.setName('keyword')
	.setContexts(InteractionContextType.Guild)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setDescription('Manage keywords for randomized responses on mention.')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a new keyword to listen for.')
			.addStringOption((option) =>
				option.setName('keyword').setDescription('The keyword to add.').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove a keyword and all its responses.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to remove.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand.setName('list').setDescription('List all keywords in this server.')
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('info')
			.setDescription('List all responses for a keyword.')
			.addStringOption((option) =>
				option
					.setName('keyword')
					.setDescription('The keyword to inspect.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	);

async function add(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);

	if (await keywordExists(guildId!, keyword))
		return await replyOrFollowUp(interaction, `Keyword '${keyword}' already exists!`);

	await createKeyword(guildId!, keyword);
	await replyOrFollowUp(interaction, `Keyword '${keyword}' was added successfully!`);
}

async function remove(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const keyword = options.getString('keyword', true);

	const existing = await findKeyword(guildId!, keyword);
	if (!existing) return await replyOrFollowUp(interaction, 'Specified keyword does not exist!');

	await deleteKeyword(guildId!, keyword);
	return await replyOrFollowUp(interaction, `Keyword '${keyword}' removed!`);
}

async function list(interaction: ChatInputCommandInteraction) {
	const { guildId } = interaction;

	const keywords = await findKeywords(guildId!);
	if (keywords.length === EMPTY)
		return await replyOrFollowUp(interaction, 'No keywords have been registered in this server.');

	const keywordStr = keywords.map((k) => k.word).join('\n- ');
	return await replyOrFollowUp(interaction, `Keywords:\n- ${keywordStr}`);
}

export async function execute(interaction: ChatInputCommandInteraction) {
	logkwRespCmd(interaction, 'Keyword command');
	const subCmd = interaction.options.getSubcommand();

	switch (subCmd) {
		case 'add':
			return await add(interaction);
		case 'remove':
			return await remove(interaction);
		case 'list':
			return await list(interaction);
		case 'info':
			return await listResponses(interaction);
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
		default:
			throw new Error(`Uknown subcommand option: ${subCmd} - ${focused.name}`);
	}
}
