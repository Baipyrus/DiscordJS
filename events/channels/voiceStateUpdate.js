import { PermissionsBitField } from 'discord.js';
import { ChannelType, Events } from 'discord.js';

export const name = Events.VoiceStateUpdate;
export async function execute(_, state) {
	if (!state.channel) return;

	const member = state.member;
	const name = member.user.username;

	const channels = state.guild.channels;
	const privCh = await channels.create({
		name: `${name}${name.endsWith('s') ? "'" : "'s"} channel`,
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

	await state.setChannel(privCh);

	console.debug(`[DEBUG] User '${member}' created private channel!`);
}
