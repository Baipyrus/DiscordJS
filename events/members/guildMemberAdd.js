import { Events, GuildMember } from 'discord.js';
import { Role } from '../../database.js';

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

	try {
		// Add roles to member
		await member.roles.add(roles.map((role) => role.id));
	} catch (error) {
		// Missing permissions
		console.error(error);
		await member.user.send('Could not assign roles. Please contact server staff.');
	}
	console.info(`[INFO] Added ${roles.length} roles to new member with ID '${member.user.id}'.`);
}
