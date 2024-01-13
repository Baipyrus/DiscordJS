import Gamedig from 'gamedig';
import fs from 'fs';

import { TEMP_FOLDER_LOCATION, CONFIG_FOLDER_LOCATION } from '$env/static/private';

export const getAllServer = async () => {
	if (!fs.existsSync(TEMP_FOLDER_LOCATION)) fs.mkdirSync(TEMP_FOLDER_LOCATION, { recursive: true });

	if (!fs.existsSync(CONFIG_FOLDER_LOCATION))
		fs.mkdirSync(CONFIG_FOLDER_LOCATION, { recursive: true });

	if (!fs.existsSync(CONFIG_FOLDER_LOCATION + 'gameserverlist.json')) return [];

	const serverList = JSON.parse(fs.readFileSync(CONFIG_FOLDER_LOCATION + 'gameserverlist.json'));

	let parsedResults = [];

	for (const server of serverList) {
		let status = true;
		let serverResponse;
		try {
			serverResponse = await Gamedig.query({
				type: server.type,
				host: server.ip,
				port: server.port
			});
		} catch (error) {
			status = false;
		}

		let parsedResult;
		if (status) {
			parsedResult = {
				game: server.type,
				name: serverResponse.name,
				playerCount: {
					current: serverResponse.players.length,
					max: serverResponse.maxplayers
				},
				status: status,
				ip: server.ip,
				link: ''
			};
		} else {
			parsedResult = {
				game: server.type,
				name: server.name,
				playerCount: {
					current: 0,
					max: 0
				},
				status: status,
				ip: serverResponse.connect,
				link: server.link
			};
		}

		parsedResults.push(parsedResult);
	}

	fs.writeFile(
		TEMP_FOLDER_LOCATION + 'gameserverstatus.json',
		JSON.stringify(parsedResults),
		(err) => {
			if (err) throw err;
		}
	);
};
