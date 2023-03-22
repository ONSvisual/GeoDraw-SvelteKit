import { base } from "$app/paths";

// data constants
export const cdnbase = "https://cdn.ons.gov.uk/maptiles/cp-geos/v1";
export const places = `${base}/data/places-list.csv`;
export const mapstyle = `${base}/data/style.json`
export const points = {
  key: "oa",
  url: `${cdnbase}/oa21-data.csv`,
  parents: ["lsoa", "msoa"],
  year: 2021
};
export const boundaries = {
  key: "oa",
  url: "https://cdn.ons.gov.uk/maptiles/administrative/2021/oa/v2/boundaries/{z}/{x}/{y}.pbf",
  id_key: "areacd"
};

// map constants
export const minzoom = 6;
export const maxzoom = 14;
export const drawtools = true
export const location = {
    bounds: [
        [-5.816, 49.864],
        [1.863, 55.872]
    ], // England & Wales bounding box
};
export const maxbounds = [
    [-9, 49.5],
    [3.5, 61]
];