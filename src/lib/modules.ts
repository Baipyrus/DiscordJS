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

// Pretty trimmed message of at most two properties
const propsTrimmedStr = (props: string[]) => {
	const TRIM_PROPS_LIMIT = 2;
	const missingStr = props
		.slice(0, TRIM_PROPS_LIMIT)
		.map((p) => `'${p}'`)
		.join(', ');
	return missingStr + (props.length > TRIM_PROPS_LIMIT ? ', ...' : '');
};

// Imports and checks a command from a path as a module.
export const importAndCheck = async <T extends CommandModule | EventModule>(
	filePath: string,
	type: new (...args: any[]) => T,
	verbose?: boolean
): Promise<T | null> => {
	// Skip non js/ts or example files
	if (!/(\.js|\.ts)$/.test(filePath) || /\.example(\.js|\.ts)$/.test(filePath)) return null;

	// Load module from file path
	const command = (await import(filePath)) as T;

	// Assume property requirements from type specification
	let required, optional: string[];
	let typeStr, name: string;

	switch (type as unknown) {
		case CommandModule:
			required = requiredCommandProps;
			optional = optionalCommandProps;

			typeStr = 'CommandModule';
			name = (command as CommandModule).data.name;
			break;
		case EventModule:
			required = requiredEventProps;
			optional = optionalEventProps;

			typeStr = 'EventModule';
			name = (command as EventModule).name;
			break;
		default:
			logger.error(`The module at ${filePath} is not of any recognizable type!`, {
				label: 'IMPORT'
			});
			return null;
	}

	// Warn incomplete command implementaion
	const missingRequired = required.filter((prop) => !(prop in command));
	if (missingRequired.length > EMPTY) {
		logger.error(
			`The ${typeStr} at ${filePath} is missing at least one required property (${propsTrimmedStr(missingRequired)}).`,
			{
				label: 'IMPORT'
			}
		);

		return null;
	}

	if (verbose) {
		logger.info(`Detected a ${typeStr} named '${name}' at ${filePath}!`, { label: 'IMPORT' });

		const missingOptional = optional.filter((prop) => !(prop in command));
		if (missingOptional.length > EMPTY)
			logger.warn(
				`The module '${name}' is missing at least one optional property (${propsTrimmedStr(missingOptional)}).`,
				{
					label: 'IMPORT'
				}
			);
	}

	// Add command to collection
	return command;
};
