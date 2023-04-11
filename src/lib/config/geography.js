import { base } from "$app/paths";

// data constants
export const cdnbase = "https://cdn.ons.gov.uk/maptiles/cp-geos-lsoa/v1";
export const places = `${base}/data/places-list.csv`;
export const mapstyle = `${base}/data/style.json`;
export const points = {
  key: "lsoa",
  url: `${base}/data/lsoa21-data.csv`,
  parents: ["msoa"],
  year: 2021
};
export const boundaries = {
  key: "lsoa",
  url: "https://cdn.ons.gov.uk/maptiles/administrative/2021/lsoa/v2/boundaries/{z}/{x}/{y}.pbf",
  id_key: "areacd"
};
export const lsoa_pts_path = `${base}/data/lsoa11-parents.csv`;
export const lsoa_lkp_path = `${base}/data/lsoa21-lsoa11-lookup.json`;

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