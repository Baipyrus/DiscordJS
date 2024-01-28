import {
	ActionRowBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('login')
	.setDescription('Opens a login pop-up.');
export async function modalSubmit(interaction) {
	await interaction.reply({
		content: 'Successfully submitted Form!',
		ephemeral: true
	});
}
export async function execute(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('login-modal')
		.setTitle('Login Form');

	const user = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setCustomId('user')
			.setLabel('Enter username:')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
	);
	const password = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setCustomId('password')
			.setLabel('Enter password:')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
	);

	modal.addComponents(user, password);

	await interaction.showModal(modal);
}
