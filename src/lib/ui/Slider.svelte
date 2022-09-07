<script>
	import { onMount } from "svelte";
	
	export let min = 0.2;
	export let max = 30;
	export let step = 0.1;
	export let value = 5;
	export let width = 200;
	
	let range, thumb, track;

	const updateSlider = (value) => {
		if (thumb) {
			let percent = ((value - min) / (max - min)) * 100;
			thumb.style.left = `${percent}%`;
			thumb.style.transform = `translate(-${percent}%, -50%)`;
			track.style.width = `${percent}%`;
		}
	}

	onMount(() => {
		range.oninput = (e) => updateSlider(e.target.value);
		updateSlider(value) // Init value
	})
	
	$: updateSlider(value);
</script>

<div class="wrap">
  <input type="range" class="range" {min} {max} {step} bind:value bind:this={range} style:width="{width}px">
  <div class="track">
    <div class="track-inner" bind:this={track}/>
  </div>
  <div class="thumb" bind:this={thumb}/>
</div>

<style>
	.wrap {
		position: relative;
	}
	.range {
		cursor: pointer;
		opacity: 0;
	}
	.range::-ms-tooltip {
		display: none;
	}
	.track {
		width: 100%;
		height: 4px;
		background: #DDDDDD;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
	}
	.track-inner {
		width: 0;
		height: 100%;
		background: black;
	}
	.thumb {
		width: 16px;
		height: 16px;
		background: black;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 0;
		transform: translate(0%, -50%);
		pointer-events: none;
	}
</style>