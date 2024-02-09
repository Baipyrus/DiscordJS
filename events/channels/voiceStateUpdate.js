import { ChannelType, Events, PermissionFlagsBits } from 'discord.js';
import { VoiceChannel } from '../../database.js';

const vcPermissionOverwrites = [
	PermissionFlagsBits.ReadMessageHistory,
	PermissionFlagsBits.PrioritySpeaker,
	PermissionFlagsBits.ManageMessages,
	PermissionFlagsBits.ManageChannels,
	PermissionFlagsBits.DeafenMembers,
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.ViewChannel,
	PermissionFlagsBits.MuteMembers,
	PermissionFlagsBits.MoveMembers,
	PermissionFlagsBits.Connect,
	PermissionFlagsBits.Stream,
	PermissionFlagsBits.UseVAD,
	PermissionFlagsBits.Speak
];

const getChannel = async (member, channels) => {
	// Check database for existing channel
	const ownCh = await VoiceChannel.findOne({
		where: {
			owner: member.user.id
		}
	});
	if (ownCh !== null) {
		return await channels.fetch(ownCh.id);
	}

	// Create private channel with all permissions
	const name = member.user.username;
	const chName = `${name}${name.toLowerCase().endsWith('s') ? "'" : "'s"} channel`;
	const privCh = await channels.create({
		name: chName,
		type: ChannelType.GuildVoice,
		permissionOverwrites: [
			{
				id: member.id,
				allow: vcPermissionOverwrites
			}
		]
	});

	// Save newly created channel
	await VoiceChannel.create({
		id: privCh.id,
		owner: member.user.id
	});

	return privCh;
};

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
export async function execute(oldState, newState) {
	await leftVoiceChat(oldState)
	if (!newState.channel) return;

	// Find channel by id, return if not registered for customs
	const createCh = await VoiceChannel.findOne({
		where: {
			id: newState.channel.id,
			create: true
		}
	});
	if (createCh === null) return;

	// Extract user data
	const member = newState.member;

	// Extract channel data
	const channels = newState.guild.channels;
	let step = 'create';
	try {
		const privCh = await getChannel(member, channels);

		step = 'move to';
		// Move user to private channel
		await newState.setChannel(privCh);
		console.info(`[INFO] User '${name}' created private channel with ID ${privCh.id}.`);
	} catch (error) {
		console.error(error);
		await member.send(`Failed to ${step} channel! Please contact server staff.`);
	}
}
