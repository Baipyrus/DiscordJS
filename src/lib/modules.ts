import Module from 'module';
import { EMPTY } from '$lib/constants.js';
import { logger } from '$lib/Logger.js';
import type { ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js';

export class CommandModule extends Module {
	data!: SlashCommandBuilder | ContextMenuCommandBuilder;
	execute!: (...args: any[]) => void | Promise<void>;
	autocomplete?: (...args: any[]) => void | Promise<void>;
	modalSubmit?: (...args: any[]) => void | Promise<void>;
}

export class EventModule extends Module {
	name!: string;
	execute!: (...args: any[]) => void | Promise<void>;
	once?: boolean;
}

// INFO: Update these lists of attributes when updating the modules above!
const requiredCommandProps = ['data', 'execute'];
const optionalCommandProps = ['autocomplete', 'modalSubmit'];
const requiredEventProps = ['name', 'execute'];
const optionalEventProps = ['once'];

// Imports and checks a command from a path as a module.
export const importAndCheck = async <T extends CommandModule | EventModule>(
	filePath: string,
	type: new (...args: any[]) => T
): Promise<T | null> => {
	// Skip non-js or example files
	if (!filePath.endsWith('.ts') || filePath.endsWith('.example.ts')) return null;

	// Load module from file path
	const command = (await import(filePath)) as T;

	// Assume property requirements from type specification
	let required, optional: string[];
	switch (type as unknown) {
		case CommandModule:
			required = requiredCommandProps;
			optional = optionalCommandProps;
			break;
		case EventModule:
			required = requiredEventProps;
			optional = optionalEventProps;
			break;
		default:
			logger.error(`The module at ${filePath} is not of any recognizable type!`, {
				label: 'STARTUP'
			});
			return null;
	}

	// Warn incomplete command implementaion
	const missingRequired = required.filter((prop) => !(prop in command));
	if (missingRequired.length > EMPTY) {
		// Pretty trimmed message of at most two properties
		const TRIM_PROPS_LIMIT = 2;
		const missingStr =
			missingRequired
				.slice(0, TRIM_PROPS_LIMIT)
				.map((prop) => `'${prop}'`)
				.join(', ') + (missingRequired.length > TRIM_PROPS_LIMIT ? ', ...' : '');

		logger.error(
			`The module at ${filePath} is missing at least one required property (${missingStr}).`,
			{
				label: 'STARTUP'
			}
		);

		return null;
	}

	const missingOptional = optional.filter((prop) => !(prop in command));
	if (missingOptional.length > EMPTY)
		missingOptional.forEach((name) =>
			logger.warn(`The module at ${filePath} is missing an optional '${name}' property.`, {
				label: 'STARTUP'
			})
		);

	// Add command to collection
	return command;
};
