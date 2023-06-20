<script>
	export let value;
	export let prefix = "";
	export let suffix = "";
	export let unit = null;
	export let description = null;
	export let format = d => d.toLocaleString('en-GB');
	export let highlightColor = "lightgrey";
  export let rounded = "";
</script>

<div class="num-big">{prefix ? prefix : ""}{format(value)}{suffix}</div>
{#if unit}
<div class="num-suffix">{unit}</div>
{/if}
{#if description}
<div class="num-desc" style="--highlightColor: {highlightColor}">{@html description}</div>
{/if}
{#if rounded}
<small>{rounded}</small>
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
    font-size: 18px;
		max-width: 100%;
		line-height: 1.1;
	}
	.num-desc {
		display: block;
    font-size: 16px;
		margin-top: 18px;
		color: #555;
		line-height: 1.6;
	}
	:global(.num-desc mark) {
		font-weight: bold;
		background-color: var(--highlightColor, lightgrey);
		padding: 0 4px;
	}
  small {
    font-size: 14px;
    line-height: 1.3;
    display: block;
    margin-top: 8px;
    color: #707070;
  }
</style>