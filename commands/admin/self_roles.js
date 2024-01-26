import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('self_roles')
	.setDescription('Manages reactions for self roles.');
export async function execute(interaction) {
	await interaction
		.reply('Unimplemented!');
}
