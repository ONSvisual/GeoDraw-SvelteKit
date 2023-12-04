import { cdnbase } from "$lib/config/geography";

export default async function(codes) {
  // Check if area is in England and/or Wales
  const coverage = Array.from(new Set(codes.map(c => c[0])));
  const eng = coverage.includes("E");
  const wal = coverage.includes("W");

  const code = eng && wal ? "K04000001" : wal ? "W92000004" : "E92000001";

  const geo = await (await fetch(`${cdnbase}/${code.slice(0, 3)}/${code}.json`)).json();

  const data = {
    areanm: geo.properties.areanm,
    areacd: geo.properties.areacd,
    group: eng && wal ? "" : "Country",
    geometry: geo.geometry,
    bbox: geo.properties.bounds,
    codes: geo.properties.c21cds
  }

  return {parents: [data], coverage};
}