<script>
	export let title;
	export let x;
	export let y;
	export let width;
	
	let w;
	
	const xPad = 4;
	
	$: xPos = w && x + (w / 2) > width - xPad ? width - (w / 2) - xPad : w && x - (w / 2) < 0 + xPad ? (w / 2) + xPad : x;
</script>

<div class="tooltip" style:top="{y}px" style:left="{xPos}px" bind:clientWidth={w}>
  {title}
  <div class="caret" style:transform="translateX({(w / x) + (x - xPos)}px)"></div>
</div>

<style>
	.tooltip {
		background: #333;
		color: white;
		border-radius: 2px;
		padding: 4px;
		position: absolute;
		transform: translate(-50%,7px);
    font-size: 0.85em;
    white-space: nowrap;
		pointer-events: none;
		z-index: 9999;
	}
	.caret {
		content: " ";
		position: absolute;
		bottom: calc(100% - 1px);  /* At the top of the tooltip */
		left: 50%;
		margin-left: -6px;
		border-width: 6px;
		border-style: solid;
		border-color: transparent transparent #333 transparent;
		pointer-events: none;
	}
</style>