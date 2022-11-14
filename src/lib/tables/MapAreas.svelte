<script>
	import maplibre from 'maplibre-gl';
	import bbox from '@turf/bbox';
	import { onMount } from 'svelte';

	const style = "https://bothness.github.io/ons-basemaps/data/style-outdoor.json";

	export let geojson = null;
	export let color = '#1f8ab0' //"#206095";
	export let lineWidth = 2;
	export let fillOpacity = 0.2;
	
	let map;
	let container;
	let w;
	
	onMount(() => {
		map = new maplibre.Map({
			container,
			style,
			bounds,
			interactive: false,
    	preserveDrawingBuffer: true
		});
		
		map.on('load', () => {
			map.addSource('boundary', {type: 'geojson', data});
			map.addLayer({
				'id': 'boundary-fill',
				'type': 'fill',
				'source': 'boundary',
				'layout': {},
				'paint': {
					'fill-color': color,
					'fill-opacity': fillOpacity
				}
			});
			map.addLayer({
				'id': 'boundary-line',
				'type': 'line',
				'source': 'boundary',
				'layout': {},
				'paint': {
					'line-color': color,
					'line-width': lineWidth
				}
			});
		});
	});
	
	function fitBounds(bounds) {
    console.log("refitting");
		if (map) {
      map.resize();
      map.fitBounds(bounds, {padding: 20, animate: false});
    }
	}
	
	$: bounds = geojson ? bbox(geojson) : [[-9, 49], [2, 61]];
	$: data = geojson ? geojson : {'type': 'Polygon', 'coordinates': []};
	$: w && fitBounds(bounds);
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.css"
	/>
</svelte:head>

<div id="map" class="center" bind:this={container} bind:clientWidth={w}/>

<style>
	#map {
		margin: 0;
		padding: 0;
    height: 300px;
	}
</style>