import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('custom_vc')
    .setDMPermission(false)
    .setDescription('Manages reactions for self roles.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('create')
            .setDescription('Creates new voice channel.')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setRequired(true)
                    .setDescription('The name to use for the voice channel.')
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('register')
            .setDescription('Registers an existing voice channel.')
            .addStringOption((option) =>
                option
                    .setName('id')
                    .setRequired(true)
                    .setDescription('The ID to reference the voice channel to be used.')
            )
    );
export async function execute(interaction) {
    const { options } = interaction;

    switch (options.getSubcommand()) {
        case 'create':
            const name = options.getString('name');
            break;
        case 'register':
            const id = options.getString('id');
            break;
    }
}
