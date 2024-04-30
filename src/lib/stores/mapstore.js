import { readable, writable, derived } from 'svelte/store';
import { boundaries, promoteId } from '$lib/config/geography';

// global variables shared between units.
export const centroids = writable();
export const draw_type = writable(undefined); // drawing tool type
export const selected = writable([{oa:new Set()}]); // which layers contain data e.g. ['centroids']
export const mapsource = derived(centroids, ($centroids) => ({
    area: {
        type: 'vector',
        maxzoom: 12, // IMPORTANT: This is the maximum zoom the tiles are available for, so they can over-zoom
        minzoom: 6, // IMPORTANT: This is the minimum zoom available
        tiles: [boundaries.url],
        promoteId
    },
    points: {
        type: 'geojson',
        data: $centroids.geojson
    },
})); // source dictionary
export const maplayer = readable([
    {
        id: 'bounds',
        source: 'area',
        'source-layer': boundaries.layer,
        type: 'fill',
        paint: {
        'fill-color': 'transparent',
        'fill-opacity': 1
        },
    },
    {
        id: 'bounds-line',
        source: 'area',
        'source-layer': boundaries.layer,
        type: 'line',
        paint: {
        'line-color': 'steelblue',
        'line-width': ['case', ['==', ['feature-state', 'hovered'], true], 2, 0.3]
        },
    },
    {
        id: 'cpt',
        source: 'points',
        type: 'circle',
        minzoom: 10,
        paint: {
        'circle-radius': 1,
        'circle-color': 'coral'
    }}
]); // layer list
export const mapobject = writable(undefined); // the mapbox 'map' object
export let add_mode = writable(true);
export let draw_enabled = writable(false);
export const radiusInKm = writable(1);