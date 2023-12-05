import { base } from "$app/paths";

// data constants
export const cdnbase = "https://ons-dp-prod-cdn.s3.eu-west-2.amazonaws.com/maptiles/ap-geos/v2";
export const places = `${base}/data/places-list.csv`;
export const mapstyle = `${base}/data/style.json`
export const points = {
  key: "lsoa",
  url: `${base}/data/lsoa21-lookup.json`,
  parents: ["msoa", "ltla", "rgn"],
  year: 2021
};
export const boundaries = {
  key: "lsoa",
  layer: "boundaries",
  url: "https://cdn.ons.gov.uk/maptiles/administrative/2021/lsoa/v3/boundaries/{z}/{x}/{y}.pbf",
  id_key: "areacd",
  pt_key: "parentcd"
};
export const lookup11 = `${base}/data/lsoa11-lookup.json`;
export const lookup21_11 = `${base}/data/lsoa21-lsoa11-lookup.json`;

// map constants
export const minzoom = 4;
export const maxzoom = 14;
export const drawtools = true
export const location = {
    bounds: [
        [-5.816, 49.864],
        [1.863, 55.872]
    ], // England & Wales bounding box
};
export const maxbounds = [
    [-11, 49.5],
    [5.5, 61]
];