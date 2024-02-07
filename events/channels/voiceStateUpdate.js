import { ChannelType, Events, PermissionsBitField } from 'discord.js';
import { VoiceChannel } from '../../database.js';

export const name = Events.VoiceStateUpdate;
export async function execute(_, state) {
	if (!state.channel) return;

	// Find channel by id, return if not registered for customs
	const channel = await VoiceChannel.findOne({
		where: {
			id: state.channel.id
		}
	});
	if (channel === null) return;

	// Extract user data
	const member = state.member;
	const name = member.user.username;

	// Extract channel data
	const channels = state.guild.channels;
	try {
		// Create private channel with all permissions
		const chName = `${name}${name.endsWith('s') ? "'" : "'s"} channel`;
		const privCh = await channels.create({
			name: chName,
			type: ChannelType.GuildVoice,
			permissionOverwrites: [
				{
					id: member.id,
					allow: [
						PermissionsBitField.All
					]
				}
			]
		});

		// Move user to private channel
		await state.setChannel(privCh);
		console.info(`[INFO] User '${name}' created private channel with ID ${privCh.id}.`);
	} catch (error) {
		console.error(error);
		await member.send('Could no create or move to channel! Please contact server staff.');
	}
}
