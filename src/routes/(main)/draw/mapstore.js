import {
    writable,
    get
} from 'svelte/store';

// global variables shared between units. 
export const draw_type = writable(undefined); // drawing tool type
export const selected = writable([{oa:new Set(),lat:[],lng:[]}]); // which layers contain data e.g. ['centroids']
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

export let minzoom = 4;
export let maxzoom = 14;
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
// `https://bothness.github.io/ons-basemaps/data/style-omt.json`
// `/css/style-omt.json`
//'https://api.mapbox.com/styles/v1/carbondesignsystem/ck7c8ce1y05h61ipb2fixfe76?access_token=pk.eyJ1IjoibWJvc3RvY2siLCJhIjoiY2s5ZWRqb2w1MDBnYjNmbzcxb2xxaGZjeSJ9.ZOeAUq-8dsbN7zqgG7vkdQ'
//"https://bothness.github.io/ons-basemaps/data/style-omt.json";

export function c2bbox(lat, lng) {

    var min_coords = [
        Math.min.apply(null, lng),
        Math.min.apply(null, lat)
    ]
    var max_coords = [
        Math.max.apply(null, lng),
        Math.max.apply(null, lat)
    ]

    return [min_coords, max_coords]
}


