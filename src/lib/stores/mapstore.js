import { writable } from 'svelte/store';

// global variables shared between units. 
export const draw_type = writable(undefined); // drawing tool type
export const selected = writable([{oa:new Set()}]); // which layers contain data e.g. ['centroids']
export const mapsource = writable({}); // source dictionary
export const maplayer = writable([]); // layer list
export const mapfunctions = writable([]);
export const mapobject = writable(undefined); // the mapbox 'map' object
export let add_mode = writable(true);
export let draw_enabled = writable(false);
export const radiusInKm = writable(1);
export const centroids = writable();
export const user_geometry = writable({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
  });//store the polygon created by the user