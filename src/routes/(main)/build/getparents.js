import { feature } from "topojson-client";
import bbox from "@turf/bbox";
import bboxPoly from "@turf/bbox-polygon";
import intersects from "@turf/boolean-intersects";
import buffer from "@turf/buffer";
import { base } from "$app/paths";

const topojson = `${base}/data/lad-cty-rgn.json`;

export default async function(poly, codes) {
  // Check if area is in England and/or Wales
  let prefixes = codes.map(c => c[0]);
  let eng = prefixes.includes("E");
  let wal = prefixes.includes("W");

  // Add countries
  let parents = [{areacd: "K04000001", areanm: "England and Wales"}];
  if (eng) parents.push({areacd: "E92000001", areanm: "England"});
  if (wal) parents.push({areacd: "W92000004", areanm: "Wales"});

  // Load topojson and convert to geojson
  let topo = await(await fetch(topojson)).json();
  let geo = [];
  if (eng) {
    geo.push(feature(topo, "rgn"));
    geo.push(feature(topo, "cty"));
  }
  geo.push(feature(topo, "lad"))

  // Test features against loaded polygon
  let buffered = buffer(poly, 0.5, {units: 'kilometers'});
  let bounds = bbox(buffered);
  let boundsPoly = bboxPoly(bounds);
  geo.forEach(g => {
    let filtered = g.features.filter(f => intersects(f, boundsPoly));
    filtered.forEach(f => {
      if (intersects(f, buffered)) parents.push(f.properties);
    });
  });
  return parents;
}