<script>
	import Serverlist  from '$lib/client/components/Serverlist.svelte'
	import CurrentTunier from "$lib/client/components/CurrentTunier.svelte";
	let year = new Date().getFullYear();
</script>

<h1>Willkommen zur Weihnachtslan {year}</h1>
<table>
	<tr>
		<td>
			<h2>aktive Server</h2>
			<Serverlist />
		</td>
		<td>|</td>
		<td>-----</td>
		<td>|</td>
		<td>
			<h2>LAN Tunier</h2>
			<CurrentTunier />
		</td>
	</tr>
</table>
