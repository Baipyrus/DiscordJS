import { REST, Routes } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { config } from 'dotenv';
import { readdir } from 'fs';

config();
const readdirAsync = promisify(readdir);

const required = ['data', 'execute'];
const optional = ['autocomplete', 'modalSubmit'];

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

// and deploy your commands!
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
const mainPath = join(__dirname, 'commands');
readdirAsync(mainPath)
	.then(
		async (categories) =>
			// For each category directory
			await Promise.all(
				categories.map(async (category) => {
					const catPath = join(mainPath, category);
					const files = (await readdirAsync(catPath)).filter((file) => file.endsWith('.js') && !file.endsWith('.example.js'));
					// For each command file
					return await Promise.all(
						files.map(async (current) => {
							const filePath = join(catPath, current);
							const command = await import(filePath);
							// Warn incomplete commands
							if (!required.every((name) => name in command)) {
								console.error(
									`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`
								);
								return 0;
							}
							const properties = optional.filter((name) => !(name in command));
							if (properties.length > 0)
								properties.forEach((name) =>
									console.warn(
										`[WARNING] The command at ${filePath} is missing a optional "${name}" property.`
									)
								);
							// Add command to collection
							return command.data.toJSON();
						})
					);
				})
			)
	)
	.then((commands) => commands.reduce((a, i) => a.concat(i), []).filter((e) => e !== 0))
	.then(putCommands);
