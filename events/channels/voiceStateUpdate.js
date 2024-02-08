import { ChannelType, Events, PermissionFlagsBits } from 'discord.js';
import { VoiceChannel } from '../../database.js';

const vcPermissionOverwrites = [
	PermissionFlagsBits.ManageRoles,
	PermissionFlagsBits.ManageChannels,
	PermissionFlagsBits.ViewChannel,
	PermissionFlagsBits.ModerateMembers,
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.SendMessagesInThreads,
	PermissionFlagsBits.ManageMessages,
	PermissionFlagsBits.ReadMessageHistory,
	PermissionFlagsBits.AddReactions,
	PermissionFlagsBits.Connect,
	PermissionFlagsBits.Speak,
	PermissionFlagsBits.MuteMembers,
	PermissionFlagsBits.DeafenMembers,
	PermissionFlagsBits.MoveMembers,
	PermissionFlagsBits.UseVAD
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
	})

	return privCh;
};

export const name = Events.VoiceStateUpdate;
export async function execute(_, state) {
	if (!state.channel) return;

	// Find channel by id, return if not registered for customs
	const createCh = await VoiceChannel.findOne({
		where: {
			id: state.channel.id,
			create: true,
		}
	});
	if (createCh === null) return;

	// Extract user data
	const member = state.member;

	// Extract channel data
	const channels = state.guild.channels;
	let step = 'create';
	try {
		const privCh = await getChannel(member, channels);

		step = 'move to';
		// Move user to private channel
		await state.setChannel(privCh);
		console.info(`[INFO] User '${name}' created private channel with ID ${privCh.id}.`);
	} catch (error) {
		console.error(error);
		await member.send(`Failed to ${step} channel! Please contact server staff.`);
	}
}
