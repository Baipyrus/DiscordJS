import { Events, GuildMember } from 'discord.js';

export const name = Events.GuildMemberAdd;
/** @param {GuildMember} member */
export function execute(member) {
	console.log(member);
}
