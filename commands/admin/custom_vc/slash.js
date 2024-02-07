import { ChannelType, SlashCommandBuilder } from 'discord.js';
import { VoiceChannel } from '../../../database.js';

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
    const { guild, options } = interaction;

    let step;
    try {
        switch (options.getSubcommand()) {
            case 'create': {
                // Get channel name from user input
                const name = options.getString('name');

                step = 'create';
                // Create new channel
                const channel = await guild.channels.create({
                    name, type: ChannelType.GuildVoice
                });

                // Save channel data
                step = 'save';
                await VoiceChannel.create({
                    id: channel.id,
                    create: true
                });

                // Reply success to acknowledge command
                await interaction.reply({
                    content: `Successfully created channel!`,
                    ephemeral: true
                });
                break;
            }
            case 'register': {
                // Get channel id from user input
                const id = options.getString('id');

                step = 'fetch';
                // Try fetching channel by id
                await guild.channels.fetch(id);

                // Save channel data
                step = 'save';
                await VoiceChannel.create({ id, create: true });

                // Reply success to acknowledge command
                await interaction.reply({
                    content: `Successfully registered channel!`,
                    ephemeral: true
                });
                break;
            }
        }
    } catch (error) {
        console.error(error);

        // Reply failed to acknowledge command
        await interaction.reply({
            content: `Failed to ${step} channel!`,
            ephemeral: true
        });
    }
}
