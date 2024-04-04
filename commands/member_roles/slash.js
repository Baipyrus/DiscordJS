import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Roles, Guilds } from '../../../database.js';

/**
 * @param {Guilds} guild
 * @param {Roles} role
 */
const registerRole = async (guild, role) => {
	// Check if guild exists in database, otherwise create it
	const guildData = { id: guild.id };
	await Guilds.findOrCreate({
		where: guildData,
		defaults: guildData
	});

	// Register role in database
	await Roles.create({
		guild: guild.id,
		id: role.id,
		assign: true
	});
};

export const data = new SlashCommandBuilder()
	.setName('member_roles')
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
	.setDescription('Assigns roles to new members.')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Registers a role to be assigned to new members.')
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('The role to assign to new members.')
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Unregisters a role from new member assignment.')
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('The role to unregister from assignmment.')
					.setRequired(true)
			)
	);
/** @param {ChatInputCommandInteraction} interaction */
export async function execute(interaction) {
	const { options } = interaction;

	// Get command options
	const role = options.getRole('role');
	switch (options.getSubcommand()) {
		case 'add': {
			// Search for role in database
			/** @type {import('../../../models/roles.js').Role|null} */
			const found = await Roles.findOne({
				where: {
					id: role.id
				}
			});

			// Toggle role assignment if found
			if (found !== null) {
				found.assign = true;
				await found.save();
				// Otherwise create new database entry
			} else await registerRole(interaction.guild, role);

			// Reply successfully to acknowledge command
			await interaction.reply({
				content: 'Successfully registered role.',
				ephemeral: true
			});

			console.info(`[INFO] Registered role to be assigned with ID '${role.id}'.`);
			break;
		}
		case 'remove': {
			// Remove role from database
			const count = await Roles.destroy({
				where: {
					id: role.id,
					assign: true
				}
			});

			// Set reply based on result of deletion
			let response = 'Successfully removed';
			if (count === 0) response = 'Failed to remove';

			// Reply to acknowledge command
			await interaction.reply({
				content: `${response} role from new member assignment!`,
				ephemeral: true
			});

			console.info(`[INFO] Removed role to be assigned with ID '${role.id}'.`);
			break;
		}
	}
}
