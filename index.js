import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { config } from 'dotenv';
import { readdir } from 'fs';

config();
const readdirAsync = promisify(readdir);

const required = ['data', 'execute'];
const optional = ['autocomplete', 'modalSubmit'];

const runClient = (commands, events) => {
	// Create a new client instance
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	client.commands = new Collection();
	commands.forEach((c) => client.commands.set(c.data.name, c));
	events.forEach((e) =>
		e.once
			? client.once(e.name, (...args) => e.execute(...args))
			: client.on(e.name, (...args) => e.execute(...args))
	);

	// Log in to Discord with your client's token
	client.login(process.env.TOKEN);
};

// Register commands from sub-directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const cmdPath = join(__dirname, 'commands');
const evtPath = join(__dirname, 'events');
readdirAsync(cmdPath)
	.then(
		async (categories) =>
			// For each category directory
			await Promise.all(
				categories.map(async (category) => {
					const catPath = join(cmdPath, category);
					const content = await readdirAsync(catPath);
					const files = content.filter((file) => file.endsWith('.js') && !file.endsWith('.example.js'));
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
							return command;
						})
					);
				})
			)
	)
	.then((commands) => commands.reduce((a, i) => a.concat(i), []).filter((e) => e !== 0))
	.then(async (commands) => {
		const content = await readdirAsync(evtPath);
		const files = content.filter((file) => file.endsWith('.js'));
		const events = await Promise.all(
			files.map(async (current) => {
				const filePath = join(evtPath, current);
				const command = await import(filePath);
				// Add event to collection
				return command;
			})
		);
		runClient(commands, events);
	});
