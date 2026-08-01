import {
	ChannelType,
	GuildChannel,
	PermissionFlagsBits,
	SlashCommandBuilder,
	ChatInputCommandInteraction
} from 'discord.js';
import { Guilds, VoiceChannels } from '../../database.js';
import { EMPTY } from '../../constants.js';

export const data = new SlashCommandBuilder()
	.setName('custom_vc')
	.setDMPermission(false)
	.setDescription('Manages reactions for self roles.')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('create')
			.setDescription('Creates new voice channel.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setRequired(true)
					.setDescription('The name to use for the voice channel.')
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('register')
			.setDescription('Registers an existing voice channel for custom channel creation.')
			.addChannelOption((option) =>
				option
					.setRequired(true)
					.setName('channel')
					.addChannelTypes(ChannelType.GuildVoice)
					.setDescription('The voice channel to be used.')
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove a voice channel from custom channel creation.')
			.addChannelOption((option) =>
				option
					.setRequired(true)
					.setName('channel')
					.addChannelTypes(ChannelType.GuildVoice)
					.setDescription('The voice channel to be unregistered.')
			)
	);
/** @param {ChatInputCommandInteraction} interaction */
export async function execute(interaction) {
	const { guild, options } = interaction;

	const name = options.getString('name');
	/** @type {GuildChannel?} */
	const selected = options.getChannel('channel');

	/** @type {string} */
	let step = '';
	const guildData = { id: guild.id };
	try {
		switch (options.getSubcommand()) {
			case 'create': {
				step = 'create';
				// Create new channel
				const channel = await guild.channels.create({
					name: name ?? 'Join to create',
					type: ChannelType.GuildVoice
				});

				step = 'save';
				// Create guild if not exists
				await Guilds.findOrCreate({
					where: guildData,
					defaults: guildData
				});
				// Save channel data
				await VoiceChannels.create({
					id: channel.id,
					guild: guild.id,
					create: true
				});

				// Reply success to acknowledge command
				await interaction.reply({
					content: `Successfully created channel!`,
					ephemeral: true
				});

				console.info(`[INFO] New custom VC created with ID '${channel.id}'.`);
				break;
			}
			case 'register': {
				step = 'save';
				// Create guild if not exists
				await Guilds.findOrCreate({
					where: guildData,
					defaults: guildData
				});

				if (!selected?.id) throw new Error('User did not specify a channel to register!');

				// Save channel data
				await VoiceChannels.create({
					id: selected.id,
					guild: guild.id,
					create: true
				});

				// Reply success to acknowledge command
				await interaction.reply({
					content: `Successfully registered channel!`,
					ephemeral: true
				});

				console.info(`[INFO] New custom VC registered using ID '${id}'.`);
				break;
			}
			case 'remove': {
				// Remove channel from guild
				step = 'remove';

				if (!selected?.id) throw new Error('User did not specify a channel to register!');

				const count = await VoiceChannels.destroy({
					where: {
						id: selected.id,
						create: true
					}
				});

				// Set reply based on result of deletion
				let response = 'Successfully removed';
				if (count === EMPTY) response = 'Failed to remove';

				// Reply to acknowledge command
				await interaction.reply({
					content: `${response} channel from custom channel creation!`,
					ephemeral: true
				});

				console.info(`[INFO] Removed custom VC with ID '${id}'.`);
				break;
			}
			default:
				throw new Error('Unexpected user subcommand!');
		}
	} catch (error) {
		console.error(error);

		// Reply failed to acknowledge command
		await interaction.reply({
			content: `Failed to ${step} channel!`,
			ephemeral: true
		});
	}
}
