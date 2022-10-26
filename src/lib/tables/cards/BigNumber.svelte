<script>
	export let value;
	export let prefix = "";
	export let suffix = "";
	export let unit = null;
	export let description = null;
	export let format = d => d;
	export let highlightColor = "lightgrey";
</script>

<div class="num-big">{prefix}{format(value)}{suffix}</div>
{#if unit}
<div class="num-suffix">{unit}</div>
{/if}
{#if description}
<div class="num-desc" style="--highlightColor: {highlightColor}">{@html description}</div>
{/if}

<style>
	.num-big {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		font-size: 3rem;
		font-weight: bold;
		line-height: 1.2;
	}
	.num-suffix {
		display: block;
		max-width: 100%;
		line-height: 1.1;
	}
	.num-desc {
		display: block;
		margin-top: 18px;
		color: #666;
		line-height: 1.6;
	}
	:global(.num-desc mark) {
		font-weight: bold;
		background-color: var(--highlightColor, lightgrey);
		padding: 0 4px;
	}
</style>