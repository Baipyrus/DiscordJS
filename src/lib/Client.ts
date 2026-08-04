import type { Client, Collection } from 'discord.js';
import type { CommandModule } from '$lib/modules.js';

export type ModifiedClient = Client & { commands: Collection<string, CommandModule> };
