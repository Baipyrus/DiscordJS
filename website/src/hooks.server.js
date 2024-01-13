import { getAllServer } from '$lib/server/scripts/refreshGameservers.js';

getAllServer();

setInterval(() => {
	getAllServer();
}, 3000);
