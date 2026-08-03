#!/usr/bin/env node

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { CommandModule, EventModule, importAndCheck } from 'lib/modules.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { EXIT_ERROR, EXIT_SUCCESS, SHUTDOWN_TIMEOUT_MS } from 'lib/constants.js';
import { readdir } from 'fs/promises';
import { logger } from 'lib/Logger.js';

let isShuttingDown = false;
const handleShutdown = (client: Client, signal: 'SIGINT' | 'SIGTERM') => {
	process.on(signal, async () => {
		if (isShuttingDown) return;
		isShuttingDown = true;

		logger.info(`Received ${signal}. Shutting down gracefully...`, { label: 'SHUTDOWN' });

		// Force-kill if connection lingers for too long
		setTimeout(() => {
			logger.error('Could not close connection in time. Forcing shutdown.', { label: 'SHUTDOWN' });
			process.exit(EXIT_ERROR);
		}, SHUTDOWN_TIMEOUT_MS);

		// Try closing Discord API connection
		await client.destroy();
		logger.info('Client shut down successfully.', { label: 'SHUTDOWN' });

		process.exit(EXIT_SUCCESS);
	});
};

// Main entry point, the bot logs on to Discord.
const runClient = (commands: CommandModule[], events: EventModule[]) => {
	// Create a new client instance
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessageReactions
		],
		partials: [Partials.Message, Partials.Reaction]
	}) as Client & { commands: Collection<string, CommandModule> };

	// The commands registered for this client.
	client.commands = new Collection();
	commands.forEach((c) => client.commands.set(c.data.name, c));

	// Register client events
	events.forEach((e) =>
		e.once
			? client.once(e.name, (...args) => e.execute(...args))
			: client.on(e.name, (...args) => e.execute(...args))
	);

	// Prepare graceful shutdown handlers
	handleShutdown(client, 'SIGINT');
	handleShutdown(client, 'SIGTERM');

	// Log in to Discord with your client's token
	client.login(process.env['TOKEN']);
};

// Register commands from sub-directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const cmdPath = join(__dirname, 'commands');
const evtPath = join(__dirname, 'events');

// For each command file
readdir(cmdPath, { withFileTypes: true, recursive: true })
	.then(async (files) =>
		// Try importing the command, see if all implementation requirements are met
		(
			await Promise.all(
				files.map((entry) => importAndCheck(join(entry.parentPath, entry.name), CommandModule))
			)
		).filter((module) => module !== null)
	)
	.then(async (commands) => {
		// For each event file
		const files = await readdir(evtPath, { withFileTypes: true, recursive: true });
		// Try importing the event, see if all implementation requirements are met
		const events = (
			await Promise.all(
				files.map((entry) => importAndCheck(join(entry.parentPath, entry.name), EventModule))
			)
		).filter((module) => module !== null);

		// Finally, run the main entry point for the client
		runClient(commands, events);
	});
