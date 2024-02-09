import { ChannelType, Events } from 'discord.js';
import { VoiceChannel } from '../../database.js';

export const name = Events.ChannelDelete;
export async function execute(channel) {
	if (channel.type !== ChannelType.GuildVoice) return;

	// Delete channel entry once channel is deleted itself
	const count = await VoiceChannel.destroy({
		where: {
			id: channel.id
		}
	});
	if (count > 0) console.info(`[INFO] Custom VC entry with ID '${channel.id}' was destroyed.`);
}
