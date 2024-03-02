import { Events, GuildMember } from 'discord.js';
import { Role } from '../../../database.js';

export const name = Events.GuildMemberAdd;
/** @param {GuildMember} member */
export async function execute(member) {
	// Find roles to be assigned in guild from database
	const roles = await Role.findAll({
		where: {
			guild: member.guild.id,
			assign: true
		}
	});

	// Ignore if no none found
	if (roles.length === 0) return;

	// Add roles to member
	member.roles.add(roles.map((role) => role.id));
}
