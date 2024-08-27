import bbox from '@turf/bbox';
import bboxPoly from '@turf/bbox-polygon';
import inPoly from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import area from '@turf/area';
import { decompressData } from "compress-csv-to-json";
import { dissolve } from '$lib/util/bundled/mapshaper';
import { roundAll } from '$lib/util/functions';
import { oaPoints, oaBoundaries } from '$lib/config/geography';

// const key = points.key;
// const code = `${points.key}${String(points.year).slice(2)}cd`;
// const parents = points.parents.map(key => ({
//   key,
//   code: `${key}${String(points.year).slice(2)}cd`
// }));

// Take a geojson feature (Polygon or MultiPolygon) and remove polygon rings smaller than a given area
// function filterGeo(geojson, areaSqm) {
//   const filterByArea = (coords) => area({ type: "Polygon", coordinates: [coords] }) > (areaSqm / 1000);
//   if (geojson.geometry.type === "Polygon") {
//     geojson.geometry.coordinates = geojson.geometry.coordinates.filter(coords => filterByArea(coords));
//   }
//   if (geojson.geometry.type === "MultiPolygon") {
//     geojson.geometry.coordinates.forEach((poly, i) => {
//       geojson.geometry.coordinates[i] = poly.filter(coords => filterByArea(coords));
//     });
//     geojson.geometry.coordinates = geojson.geometry.coordinates.filter(coords => coords[0]);
//   }
// }

class AbstractCentroids {
  constructor(sourceConfig){
    this.sourceConfig = sourceConfig;
  }

  async initialize(){
    console.log('AbstractConfig',this.sourceConfig)
    this.key = this.sourceConfig.key;
    this.code = `${this.sourceConfig.key}${String(this.sourceConfig.year).slice(2)}cd`;
    this.parents = this.sourceConfig.parents.map(key => ({
      key,
      code: `${key}${String(this.sourceConfig.year).slice(2)}cd`
    }))
    this.url = this.sourceConfig.url
  }

  parent(area) {
    // Return immediate parents for OAs
    if (typeof area === 'string') {
      return this.lookup[area][parents[0].code];
    } else {
      return area.map(cd => this.lookup[cd][parents[0].code]);
    }
  }

  expand(codes){
    return Array.isArray(codes) ?
    codes.map(c => this.childLookup[c] ? this.childLookup[c] : c).flat() :
    this.childLookup[codes] ? this.childLookup[codes] : [];
  }

  bounds(areas){
    // get a boundary for a list of OA codes
    let points = {
      type: 'GeometryCollection',
      geometries: areas.map(area => {
        let d = this.lookup[area];
        return {
          type: 'Point',
          coordinates: [d.lng, d.lat]
        }
      })
    };
    let bounds = bbox(points);
    bounds = [bounds[0] - 0.01, bounds[1] - 0.01, bounds[2] + 0.01, bounds[3] + 0.01];
    // console.log("bounds", bounds);
    return bounds;
  }


  exists(area){
    return this.lookup[area] ? true : false;
  }

  contains(geo){
    // Returns OA/LSOA codes within the coordinates of a Polygon/MultiPolygon
    let bounds = bbox(geo);
    bounds = bboxPoly(bounds);

    let areas = inPoly(this.geojson, bounds);
    areas = inPoly(areas, geo).features.map(area => area.properties[boundaries.idKey]);

    return { bbox: bounds, area: new Set(areas) };
  }

  compress(areasAll) {
    let all = {};
    let compressed = [];
    all[key] = areasAll;
    parents.forEach(p => {
      all[p.key] = areasAll.map(area => this.lookup[area][p.code]);
    });
    const keys = Object.keys(all).reverse();
    for (let i = 0; i < areasAll.length; i++) {
      if (parents.every(p => !compressed.includes(all[p.key][i]))) {
        for (let j = 0; j < keys.length; j++) {
          let thiskey = keys[j];
          if (j === keys.length - 1) {
            compressed.push(all[thiskey][i]);
          } else if (
            all[thiskey].filter(cd => all[thiskey][i] === cd).length ===
            this[`${thiskey}_count`][all[thiskey][i]]
          ) {
            compressed.push(all[thiskey][i]);
            break;
          }
        }
      }
    }
    return compressed;
  }

  async simplify(name = '',selected,mapObject) {
    const areasAll = Array.from(selected[key]);

    // compress the codes
    const compressed = this.compress(areasAll);
    const bbox = this.bounds(areasAll);
    var merge = {};
    merge.properties = {
      name,
      // bbox,
      compressed,
      areasAll,
      original: areasAll.length,
    };
    /// geo

    // move map to selection
    mapObject.fitBounds(bbox, { padding: 0, animate: false });

    merge.geojson = selected.geo
    return merge;
  }

  ////////////////////////
  // generic function defs
  ////////////////////////
  getbbox(coords) {
    var lat = coords.map(p => +p[1]);
    var lng = coords.map(p => +p[0]);

    var minCoords = [Math.min.apply(null, lng), Math.min.apply(null, lat)];
    var maxCoords = [Math.max.apply(null, lng), Math.max.apply(null, lat)];

    return [minCoords, maxCoords];
  }

  population(area) {
    return this.lookup[area].population;
  }

}

class LsoaCentroids extends AbstractCentroids {
  async initialize() {
    // Implement logic to fetch data from lsoaPoints.url
    // Update properties like geojson, lookup, etc. based on lsoa data
  }

  // Implement specific methods like parent, expand, bounds for lsoa data

  get idKey() {
    return this.sourceConfig.idKey; // Use idKey from lsoaBoundaries
  }

  get parents() {
    return this.sourceConfig.parents; // Use parents from lsoaPoints
  }

  // ... Implement other lsoa specific methods
}

class OaCentroids extends AbstractCentroids {
  async initialize() {
    let res = await fetch(this.sourceConfig.url)
    this.code = `${this.sourceConfig.key}${String(this.sourceConfig.year).slice(2)}cd`;
    let arr = decompressData(await res.json(), (columnData, rowNumber) => ({
      oa21cd: columnData[0][rowNumber],
      lsoa21cd: columnData[1][rowNumber],
      msoa21cd: columnData[2][rowNumber],
      ltla21cd: columnData[3][rowNumber],
      rgn21cd: columnData[4][rowNumber],
      lng: columnData[5][rowNumber],
      lat: columnData[6][rowNumber],
      population: columnData[7][rowNumber]
    }));
    
    let gjson = { type: 'FeatureCollection', features: [] };
    let lkp = {};
    let parentCt = {};
    let childLookup = { "E92000001": [] };
    this.sourceConfig.parents.forEach(p => parentCt[p.key] = {});

    arr.forEach(d => {
      lkp[d[this.sourceConfig.code]] = d;
      gjson.features.push({
        type: 'Feature',
        properties: { areacd: d[this.sourceConfig.code] },
        geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      });

      this.sourceConfig.parents.forEach(p => {
        if (!parentCt[p.key][d[p.code]]) {
          parentCt[p.key][d[p.code]] = 1;
          childLookup[d[p.code]] = [d[this.sourceConfig.code]];
        } else {
          parentCt[p.key][d[p.code]] += 1;
          childLookup[d[p.code]].push(d[this.sourceConfig.code]);
        }
      });
      if (d[this.code][0] === "E") childLookup["E92000001"].push(d[this.code]);
    });

    this.sizes = arr.map(d => d.r);
    this.geojson = gjson;
    this.lookup = lkp;
    this.childLookup = childLookup;
    this.sourceConfig.parents.forEach(p => this[`${p.key}_count`] = parentCt[p.key]);
  }
}



// asynchronous factory function
export async function GetCentroids(sourceName, kwargs) {
  if (sourceName === "lsoa") {
    const c = new LsoaCentroids(lsoaPoints); // Use lsoaPoints config
    await c.initialize(kwargs);
    return c;
  } else if (sourceName === "oa") {
    const c = new OaCentroids(oaPoints); // Use oaPoints config
    await c.initialize(kwargs);
    return c;
  } else {
    throw new Error(`Invalid source name: ${sourceName}`);
  }
}