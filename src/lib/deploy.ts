#!/usr/bin/env node

import { CommandModule, importAndCheck } from 'lib/modules.js';
import { REST, Routes } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from 'lib/Logger.js';
import { readdir } from 'fs/promises';

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env['TOKEN'] ?? '');

// Calls HTTP PUT to register commands in discord.
const putCommands = async (commands: unknown[]) => {
	try {
		logger.info(`Started refreshing ${commands.length} application (/) commands.`, {
			label: 'DEPLOY'
		});

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = (await rest.put(Routes.applicationCommands(process.env['CLIENT'] ?? ''), {
			body: commands
		})) as { length: number };

		console.info(`[INFO] Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error('[ERROR] Uncaught error:');
		console.error(error);
	}
};

// Register commands from source directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const cmdPath = join(__dirname, '..', 'commands');

// For each command file
readdir(cmdPath, { withFileTypes: true, recursive: true })
	.then(async (files) =>
		// Try importing the command, see if all implementation requirements are met
		(
			await Promise.all(
				files.map((entry) => importAndCheck(join(entry.parentPath, entry.name), CommandModule))
			)
		)
			.filter((module) => module !== null)
			// Convert only the command's API
			.map((module) => module.data.toJSON())
	)
	// Then upload them to the Discord API
	.then(putCommands);
