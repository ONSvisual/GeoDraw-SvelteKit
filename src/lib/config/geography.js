import { base } from "$app/paths";

// data constants
export const cdnbase = "https://ons-dp-prod-cdn.s3.eu-west-2.amazonaws.com/maptiles/ap-geos/v3";
export const places = `${base}/data/places-list.csv`;
export const mapstyle = `${base}/data/style.json`
export const points = {
  key: "oa",
  url: `${base}/data/oa21-lookup.json`,
  parents: ["lsoa", "msoa", "ltla", "rgn"],
  year: 2021,
  decompressFunc: (columnData, rowNumber) => ({
        oa21cd: columnData[0][rowNumber],
        lsoa21cd: columnData[1][rowNumber],
        msoa21cd: columnData[2][rowNumber],
        ltla21cd: columnData[3][rowNumber],
        rgn21cd: columnData[4][rowNumber],
        lng: columnData[5][rowNumber],
        lat: columnData[6][rowNumber],
        population: columnData[7][rowNumber]
      })
};
export const lsoaPoints = {
  key: "lsoa",
  url: `${base}/data/lsoa21-lookup.json`,
  parents: ["msoa", "ltla", "rgn"],
  year: 2021,
  decompressFunc: (columnData, rowNumber) => ({
    lsoa21cd: columnData[0][rowNumber],
    msoa21cd: columnData[1][rowNumber],
    ltla21cd: columnData[2][rowNumber],
    rgn21cd: columnData[3][rowNumber],
    lng: columnData[4][rowNumber],
    lat: columnData[5][rowNumber],
    population: columnData[6][rowNumber]
  })
};
export const boundaries = {
  key: "oa",
  layer: "boundaries",
  url: "https://cdn.ons.gov.uk/maptiles/administrative/2021/oa/v3/boundaries/{z}/{x}/{y}.pbf",
  idKey: "areacd",
  ptKey: "parentcd"
};
export const lsoaBoundaries = {
  key: "lsoa",
  layer: "boundaries",
  url: "https://cdn.ons.gov.uk/maptiles/administrative/2021/lsoa/v3/boundaries/{z}/{x}/{y}.pbf",
  idKey: "areacd",
  ptKey: "parentcd"
};
export const promoteId = (() => {
  const pId = {};
  pId[boundaries.layer] = boundaries.idKey;
  return pId;
})();

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