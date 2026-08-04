import { getFiles, importAndCheck } from './shared.js';
import { REST, Routes } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

/**
 * Calls HTTP PUT to register commands in discord.
 * @param {Array<object>} commands
 */
const putCommands = async (commands) => {
	try {
		console.info(`[INFO] Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationCommands(process.env.CLIENT), { body: commands });

		console.info(`[INFO] Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error('[ERROR] Uncaught error:');
		console.error(error);
	}
};

// Register commands from sub-directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const cmdPath = join(__dirname, '..', 'commands');
getFiles(cmdPath)
	// For each command file
	.then(async (files) =>
		(await Promise.all(files.map(importAndCheck)))
			.filter((module) => module !== null)
			.map((module) => module.data.toJSON())
	)
	.then(putCommands);
