import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Role } from '../../../database.js';

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
		case 'add':
			// Search for role in database
			const found = await Role.findOne({
				where: {
					id: role.id
				}
			});

			// Toggle role assignment if found
			if (found) {
				found.assign = true;
				await found.save();
				// Otherwise create new database entry
			} else
				await Role.create({
					id: role.id,
					assign: true
				});

			// Reply successfully to acknowledge command
			await interaction.reply({
				content: 'Successfully registered role.',
				ephemeral: true
			});

			console.info(`[INFO] Registered role to be assigned with ID '${role.id}'.`);
			break;
		case 'remove':
			// Remove role from database
			const count = await Role.destroy({
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
