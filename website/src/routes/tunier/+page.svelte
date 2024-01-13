<script>
	import CurrentTunier from '$lib/client/components/CurrentTunier.svelte';
</script>

<h1>Tunier</h1>

<CurrentTunier />

<button
	on:click={() => {
		location.replace('/tunier/neu');
	}}>Tunier erstellen</button
>
