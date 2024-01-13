import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
	const filePath = path.resolve('static/tournament.json');
	const data = await fs.readFile(filePath, 'utf8');
	const json = JSON.parse(data);
	return Response.json(json)
}
