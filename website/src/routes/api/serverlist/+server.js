import fs from 'fs';

import { TEMP_FOLDER_LOCATION } from '$env/static/private';

export async function GET() {
	if (!fs.existsSync(TEMP_FOLDER_LOCATION)) fs.mkdirSync(TEMP_FOLDER_LOCATION, { recursive: true });

	if (!fs.existsSync(TEMP_FOLDER_LOCATION + 'gameserverstatus.json'))
		return new Response({ status: 404 });

	const serverList = fs.readFileSync(TEMP_FOLDER_LOCATION + 'gameserverstatus.json');

	return new Response(serverList, { status: 200 });
}
