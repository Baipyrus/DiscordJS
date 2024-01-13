<script>
	import { browser } from '$app/environment';

	import ServerlistItem from './ServerlistItem.svelte';

	const allServers = async () => {
		if (browser) {
			const response = await fetch('/api/serverlist');
			const data = await response.json();
			return data;
		}
		return [];
	};
	let promise = allServers();
</script>

<h1>Lokale Serverliste</h1>
<div>
	{#await promise}
		<p>Lade Daten...</p>
	{:then servers}
		{#each servers as serverdata}
			<ServerlistItem server={serverdata} />
		{/each}
	{:catch error}
		<p>Laden der Daten war nicht möglich!</p>
	{/await}
</div>
