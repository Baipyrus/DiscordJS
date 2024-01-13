<script>
	let gameCount = 1;
	let playerCount = 1;
	let games = [];
	let player = [];

	function getGames() {
		games = [];
		const inputs = document.querySelectorAll('.Spiel');
		inputs.forEach((input) => {
			games.push(input.value);
		});
		return games;
	}
	function getPlayer() {
		player = [];
		const inputs = document.querySelectorAll('.Teilnehmer');
		inputs.forEach((input) => {
			player.push(input.value);
		});
		return player;
	}

	function addGame() {
		gameCount++;
	}

	function removeGame() {
		gameCount = gameCount > 1 ? gameCount - 1 : gameCount;
	}

	function addPlayer() {
		playerCount++;
	}

	function removePlayer() {
		playerCount = playerCount > 1 ? playerCount - 1 : playerCount;
	}

	async function addTournament() {
		let gamelist = getGames();
		let playerlist = getPlayer();

		const tournament = {
			games: gamelist,
			player: playerlist
		};
		const res = await fetch('/api/update-json/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(tournament)
		});
		if (res.ok) {
			console.log('JSON gespeichert');
		} else {
			console.error('JSON nicht gespeichert');
		}
	}
</script>

<h1>Ein neues Tunier erstellen</h1>
<h2>Spiele hinzufügen</h2>
<ul>
	{#each { length: gameCount } as _, i}
		<li>{i + 1}. <input class="Spiel" type="text" /></li>
	{/each}
</ul>
<button on:click={addGame}>noch ein Spiel hinzufügen</button>
<button on:click={removeGame}>letztes Spiel entfernen</button>
<h2>Teilnehmer hinzufügen</h2>
<ul>
	{#each { length: playerCount } as _, i}
		<li>{i + 1}.<input required class="Teilnehmer" type="text" /></li>{/each}
</ul>
<button on:click={addPlayer}>noch ein Teilnehmer hinzufügen</button>
<button on:click={removePlayer}>letzten Teilnehmer entfernen</button>
<h2>Tunier anlegen</h2>
<button on:click={addTournament}>Tunier anlegen</button>
