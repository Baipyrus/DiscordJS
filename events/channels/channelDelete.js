import { ChannelType, Events, GuildChannel } from 'discord.js';
import { VoiceChannels } from '#lib/database.js';
import { EMPTY } from '#lib/constants.js';

export const name = Events.ChannelDelete;
/** @param {GuildChannel} channel */
export async function execute(channel) {
	if (channel.type !== ChannelType.GuildVoice) return;

	// Delete channel entry once channel is deleted itself
	const count = await VoiceChannels.destroy({
		where: {
			id: channel.id
		}
	});
	if (count > EMPTY) console.info(`[INFO] Custom VC entry with ID '${channel.id}' was destroyed.`);
}
