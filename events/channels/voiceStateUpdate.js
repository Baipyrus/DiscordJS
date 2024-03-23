import {
	ChannelType,
	Events,
	GuildMember,
	GuildChannelManager,
	GuildChannel,
	VoiceState,
	PermissionsBitField
} from 'discord.js';
import { VoiceChannel } from '../../database.js';

/**
 * Function that either creates a new custom channel or gets an existing one registered in the database.
 * @param {GuildMember} member The member that caused this event.
 * @param {GuildChannelManager} guildChs All channels in this guild.
 * @param {GuildChannel} channel The channel the member joined for this event to trigger.
 * @returns {Promise<GuildChannel>} The channel, whether it's newly created or not.
 */
const getChannel = async (member, guildChs, channel) => {
	// Check database for existing channel
	const ownCh = await VoiceChannel.findOne({
		where: {
			owner: member.id
		}
	});
	if (ownCh !== null) return await guildChs.fetch(ownCh.id);

	// Create private channel with all permissions
	const name = member.user.username;
	const chName = `${name}${name.toLowerCase().endsWith('s') ? "'" : "'s"} channel`;
	const privCh = await guildChs.create({
		name: chName,
		parent: channel.parent,
		type: ChannelType.GuildVoice
	});

	// Save newly created channel
	await VoiceChannel.create({
		id: privCh.id,
		owner: member.id
	});

	return privCh;
};

/**
 * Function to delete the voice channel, if and only if the user is currently leaving and it was a custom channel.
 * @param {VoiceState} state The previous voice state the user was in.
 */
const leftVoiceChat = async (state) => {
	const { channel } = state;

	// Isn't this always false?
	if (!channel) return;

	// Get active members from channel
	const members = Array.from(channel.members);
	if (members.length > 0) return;

	// Find channel by id, return if not registered as custom
	const custom = await VoiceChannel.findOne({
		where: {
			id: channel.id,
			create: false
		}
	});
	if (custom === null) return;

	// Delete channel from guild
	await channel.guild.channels.delete(channel.id);
	console.info(`[INFO] Custom VC with ID '${channel.id}' was empty and got deleted.`);
};

export const name = Events.VoiceStateUpdate;
/**
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
export async function execute(oldState, newState) {
	const { channel, member } = newState;
	let step = 'delete';
	try {
		await leftVoiceChat(oldState);
		if (!channel) return;

		// Find channel by id, return if not registered for customs
		const createCh = await VoiceChannel.findOne({
			where: {
				id: channel.id,
				create: true
			}
		});
		if (createCh === null) return;

		step = 'create';
		// Extract channel data
		const channels = newState.guild.channels;
		const privCh = await getChannel(member, channels, channel);

		step = 'edit permissions for';
		// Edit permissionOverwrites on channel for user
		await privCh.permissionOverwrites.set([
			{
				id: member.id,
				allow: [
					PermissionsBitField.Flags.ViewChannel,
					PermissionsBitField.Flags.ManageChannels,
					PermissionsBitField.Flags.ManageRoles
				]
			}
		]);

		step = 'move to';
		// Move user to private channel
		await newState.setChannel(privCh);
		console.info(
			`[INFO] User with ID '${member.id}' created private channel with ID ${privCh.id}.`
		);
	} catch (error) {
		console.error(error);
		await member.send(`Failed to ${step} channel! Please contact server staff.`);
	}
}
