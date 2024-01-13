import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('get')
	.setDescription('Google GET Request.')
	.addStringOption((option) =>
		option
			.setName('api')
			.setRequired(true)
			.setAutocomplete(true)
			.setDescription('Specify API to call GET.')
	);
export async function autocomplete(interaction) {
	const APIs = ['serverlist', 'read-tournament', 'announcements'];

	const focused = interaction.options.getString('api');
	const filtered = APIs.filter((choice) => choice.startsWith(focused));

	await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
}
export async function execute(interaction) {
	const endpoint = interaction.options.getString('api');
	const response = await fetch(`http://localhost:5173/api/${endpoint}`);
	const text = await response.text();
	await interaction.reply({ content: text, ephemeral: true });
}
