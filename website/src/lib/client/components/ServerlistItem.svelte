<script>
	export let server;
</script>

<div>
	<table>
		<tbody>
			<tr>
				<td>{server.game}</td>
				<td>{server.name}</td>
			</tr>
			<tr>
				<td>{server.playerCount.current}/{server.playerCount.max}</td>
				<td>{server.status}</td>
			</tr>
			<tr>
				<td>{server.ip}</td>
				<td>{server.link}</td>
			</tr>
		</tbody>
	</table>
</div>
