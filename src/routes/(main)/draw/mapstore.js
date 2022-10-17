import {
    writable,
    get
} from 'svelte/store';

// global variables shared between units. 
export const draw_type = writable(undefined); // drawing tool type
export const selected = writable([{oa:new Set(),lat:[],lng:[],parents:[]}]); // which layers contain data e.g. ['centroids']
// export const select = writable([]); // selected areacodes

export const mapsource = writable({}); // source dictionary
export const maplayer = writable([]); // layer list
export const mapfunctions = writable([]);
export const mapobject = writable(undefined); // the mapbox 'map' object
export let add_mode = writable(true);
export let draw_enabled = writable(false);
export const radiusInKm = writable(1);
export const centroids = writable();


// map constants

export let minzoom = 6;
export let maxzoom = 12;
export let drawtools = true

export let location = {
    bounds: [
        [-5.816, 49.864],
        [1.863, 55.872]
    ], // England & Wales bounding box

};
export let maxbounds = [
    [-9, 49.5],
    [3.5, 61]
];

export const server = 'https://cdn.ons.gov.uk/maptiles/administrative/2021/oa/v2/boundaries'
//'https://onsvisual.github.io/ONS_CensusDraw_TileGen/geodraw_tileset'

//http://localhost:7113
export const mapstyle = `https://bothness.github.io/ons-basemaps/data/style-outdoor.json`


