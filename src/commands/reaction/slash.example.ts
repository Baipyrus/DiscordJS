import {
	EMPTY,
	ONLY_ONE_RESULT,
	REACTION_COPYABLE_BOOL,
	STR_IDX_NOT_FOUND
} from '$lib/constants.js';
import { db } from '$lib/db/index.js';
import { guilds } from '$models/guilds.example.js';
import { replyOrFollowUp } from '$lib/util.js';
import { Reaction, reactions } from '$models/reactions.example.js';
import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	InteractionContextType,
	parseEmoji,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type ApplicationCommandOptionChoiceData
} from 'discord.js';
import { and, eq } from 'drizzle-orm';

export const data = new SlashCommandBuilder()
	.setName('reaction')
	.setContexts(InteractionContextType.Guild)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setDescription('Manage reaction emojis to be copied.')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a new reaction emoji to copy.')
			.addStringOption((option) =>
				option.setName('emoji').setDescription('The emoji to add as a reaction.').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove a reaction emoji without removing existing message reactions.')
			.addStringOption((option) =>
				option
					.setName('emoji')
					.setDescription('The emoji to remove for reaction copying.')
					.setAutocomplete(true)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('list')
			.setDescription('List all reaction emojis that are currently being copied.')
	);

async function createReaction(dbReaction: Reaction) {
	const { guild, emoji, isCopyable } = dbReaction;

	// Create Guild entry into DB if not exists
	await db.insert(guilds).values({ id: guild }).onConflictDoNothing();

	const created = (await db.insert(reactions).values({ guild, emoji, isCopyable }).returning())[0];
	if (!created) throw new Error('Failed to create reaction!');

	return created as Reaction;
}

async function add(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const emoji = options.getString('emoji', true);

	const valid = parseEmoji(emoji);
	if (!valid) return await replyOrFollowUp(interaction, 'The input emoji is invalid!');

	const dbReaction = await db
		.select()
		.from(reactions)
		.where(and(eq(reactions.guild, guildId!), eq(reactions.emoji, emoji)))
		.limit(ONLY_ONE_RESULT);
	if (dbReaction.length === EMPTY) await createReaction(new Reaction(guildId!, emoji));
	else
		await db
			.update(reactions)
			.set({ isCopyable: REACTION_COPYABLE_BOOL })
			.where(eq(reactions.id, dbReaction[0]!.id));

	await replyOrFollowUp(interaction, `Reaction emoji '${emoji}' was added successfully!`);
}

async function reactionExists(dbReaction: Reaction) {
	const result = await db
		.select()
		.from(reactions)
		.where(and(eq(reactions.guild, dbReaction.guild), eq(reactions.emoji, dbReaction.emoji)))
		.limit(ONLY_ONE_RESULT);
	const found = result[0] !== undefined;
	return found;
}

export async function deleteReaction(dbReaction: Reaction) {
	const { guild, emoji } = dbReaction;
	await db.delete(reactions).where(and(eq(reactions.guild, guild), eq(reactions.emoji, emoji)));
}

async function remove(interaction: ChatInputCommandInteraction) {
	const { options, guildId } = interaction;
	const emoji = options.getString('emoji', true);

	const valid = parseEmoji(emoji);
	if (!valid) return await replyOrFollowUp(interaction, 'The input emoji is invalid!');

	const dbReaction = new Reaction(guildId!, emoji);
	if (!(await reactionExists(dbReaction)))
		return await replyOrFollowUp(interaction, `Reaction emoji '${emoji}' does not exist!`);

	await deleteReaction(dbReaction);
	await replyOrFollowUp(interaction, `Reaction emoji '${emoji}' was removed successfully!`);
}

async function list(interaction: ChatInputCommandInteraction) {
	const { guildId } = interaction;

	const results = await db.select().from(reactions).where(eq(reactions.guild, guildId!));
	if (results.length === EMPTY)
		return await replyOrFollowUp(interaction, 'No reaction emojis are registered yet!');

	const emojiStr = results.map((k) => k.emoji).join('\n- ');
	await replyOrFollowUp(interaction, `Registered Emojis:\n- ${emojiStr}`);
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const subCmd = interaction.options.getSubcommand();

	switch (subCmd) {
		case 'add':
			return await add(interaction);
		case 'remove':
			return await remove(interaction);
		case 'list':
			return await list(interaction);
		default:
			throw new Error(`Unknown subcommand: ${subCmd}`);
	}
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const { options, guildId } = interaction;
	const subCmd = options.getSubcommand();
	const focused = options.getFocused(true);

	if (subCmd !== 'remove' || focused.name !== 'emoji')
		throw new Error(`Unsupported subcommand or option: ${subCmd} - ${focused.name}`);

	// Get all registered reactions in this guild
	const results = await db.select().from(reactions).where(eq(reactions.guild, guildId!));

	// Respond with filtered list of all reaction emojis containing the substring
	await interaction.respond(
		results
			.filter((r) => r.emoji.toLowerCase().indexOf(focused.value) > STR_IDX_NOT_FOUND)
			.map((r) => ({ name: r.emoji, value: r.emoji }) as ApplicationCommandOptionChoiceData)
	);
}
