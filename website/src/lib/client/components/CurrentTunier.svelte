<script>
	import {onMount} from "svelte";

    let data = {};
    onMount(async () => {
		const response = await fetch('/api/read-tournament');
		data = await response.json();
	});
</script>

<h2>Aktuelles Tunier</h2>
<h3>Diese Spiele werden Gespielt:</h3>
<p>{data.games}</p>

<h3>Die Teilnehmer lauten: </h3>
<p>{data.player}</p>