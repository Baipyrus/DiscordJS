import { join } from 'path';
import { readdir } from 'fs/promises';

const required = ['data', 'execute'];
const optional = ['autocomplete', 'modalSubmit'];

export const getFiles = async (dir) => {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirents.map((dirent) => {
		const res = join(dir, dirent.name);
		return dirent.isDirectory() ? getFiles(res) : res;
	}));
	return Array.prototype.concat(...files);
};

export const importAndCheck = async (filePath) => {
	if (!filePath.endsWith('.js') || filePath.endsWith('.example.js')) {
		// Skip this file
		return 0;
	}
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
				`[WARNING] The command at ${filePath} is missing an optional "${name}" property.`
			)
		);
	// Add command to collection
	return command;
};
