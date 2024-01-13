import { promises as fs } from 'fs';
import path from 'path';

export async function POST({ request }) {
	const data = await request.text();
	try {
		await fs.writeFile(path.resolve('static/tournament.json'), data);
		return new Response('Array wurde gespeichert.');
	} catch (err) {
		console.error(err);
	}
}
