import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { getFiles, importAndCheck } from './shared.js';
import { Partials } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const runClient = (commands, events) => {
	// Create a new client instance
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessageReactions
		],
		partials: [Partials.Message, Partials.Reaction]
	});
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
getFiles(cmdPath)
	// For each command file
	.then(async (files) =>
		(await Promise.all(files.map(importAndCheck))).filter((module) => module !== 0)
	)
	.then(async (commands) => {
		const files = await getFiles(evtPath);
		const events = await Promise.all(files.map(async (filePath) => await import(filePath)));
		runClient(commands, events);
	});
