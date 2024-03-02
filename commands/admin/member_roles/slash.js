import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

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
}
