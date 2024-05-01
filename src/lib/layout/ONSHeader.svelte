<script>
	import { getContext } from "svelte";
	import ONSLogo from "./ONSLogo.svelte";
	import CensusLogo from "./CensusLogo.svelte";

	export let theme = "light";
	export let filled = true;
	export let census = true;

	let primary = theme == "dark" ? "white" : filled ? "#003c57" : "#222222";
	let secondary = theme == "dark" || filled ? "#a8bd3a" : "#222222";
	let censusColor = theme == "dark" ? "white" : "#902082";
</script>

<div class="col-wide middle">
	<div class="logo-block">
		<a href="https://www.ons.gov.uk/" class="logo" style:width="270px">
			<ONSLogo {primary} {secondary} />
		</a>
		{#if census}
			<a
				href="https://www.ons.gov.uk/census"
				class="logo"
				style:width="160px"
			>
				<CensusLogo color={censusColor} />
			</a>
		{/if}
	</div>
</div>

<style>
	.col-wide {
		width: 100%;
		margin: 0 12px;
		width: calc(100% - 24px) !important;
		min-width: 280px;
	}
	.middle {
		height: 46px;
		display: flex;
	}
	.logo-block {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		max-width: 100%;
	}
	.logo {
		box-sizing: border-box;
		cursor: pointer;
		padding: 4px;
		margin: 0;
		line-height: 1;
	}
</style>
