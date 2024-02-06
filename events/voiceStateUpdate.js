import { Events } from 'discord.js';

export const name = Events.VoiceStateUpdate;
export async function execute(oldState, newState) {
	console.debug('[DEBUG] Voice State Update');

	const change = !!oldState.channel ^ !!newState.channel;
	if (!change) return;

	const guild = newState.guild.name;
	const member = newState.member.user.username;
	const state = newState.channel ? 'joined' : 'left';
	const channel = (oldState.channel ?? newState.channel).name;

	console.debug(`[DEBUG] User '${member}' ${state} channel '${channel}' in guild '${guild}'.`);
}
