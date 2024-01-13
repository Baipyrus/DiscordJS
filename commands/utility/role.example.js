import {
	ActionRowBuilder,
	ComponentType,
	RoleSelectMenuBuilder,
	SlashCommandBuilder
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('role')
	.setDMPermission(false)
	.setDescription('Provides a role selector.');
export async function execute(interaction) {
	const roles = await interaction.guild.roles.fetch();
	const choices = roles.filter((r) => r.name.startsWith('test')).map((r) => r.id);

	const button = new RoleSelectMenuBuilder()
		.setMinValues(1)
		.setMaxValues(25)
		.setCustomId('role')
		.setDefaultRoles(choices)
		.setPlaceholder('Select at least one role.');

	const row = new ActionRowBuilder().addComponents(button);

	const response = await interaction.reply({
		components: [row],
		ephemeral: true
	});

	const collector = response.createMessageComponentCollector({
		componentType: ComponentType.RoleSelect,
		time: 120_000
	});

	collector.on('collect', async (i) => {
		const selection = roles
			.filter((r) => i.values.includes(r.id))
			.map((r) => r.name)
			.join(', ');
		await i.reply({ content: `You have selected: "${selection}".`, ephemeral: true });
	});
}
