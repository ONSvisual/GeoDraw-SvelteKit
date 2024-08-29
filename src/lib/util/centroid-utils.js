import bbox from '@turf/bbox';
import bboxPoly from '@turf/bbox-polygon';
import inPoly from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import area from '@turf/area';
import { decompressData } from "compress-csv-to-json";
import { dissolve } from '$lib/util/bundled/mapshaper';
import { roundAll } from '$lib/util/functions';
import { boundaries, lsoaBoundaries } from '$lib/config/geography';

class Centroids {
  constructor(sourceConfigs){
    this.sourceConfigs = sourceConfigs;
    this.data = {}; // Store fetched data for each source (key: sourceName, value: data)
  } 

  async initialize() {
    for (const sourceConfig of this.sourceConfigs) {
      const sourceName = sourceConfig.key;
      this.data[sourceName] = await this._fetchDataForSource(sourceConfig);
      // Process data for this source
      this._processDataForSource(sourceConfig, this.data[sourceName], sourceName);
    }

    // Set common properties based on sourceConfigs
    this.key = this.sourceConfigs[0].key; // Assume first source is primary
    // ... other common properties
  }

  async _fetchDataForSource(sourceConfig) {
    const res = await fetch(sourceConfig.url);
    return await res.json();
  }

  _processDataForSource(sourceConfig, data, sourceName) {
    // ... data processing logic
    const arr = decompressData(data, sourceConfig.decompressFunc)
    const key = sourceConfig.key
    const code = `${key}${String(sourceConfig.year).slice(2)}cd`;

    this.data[sourceName].geojson = { type: 'FeatureCollection', features: [] };
    this.data[sourceName].lookup = {}
    this.data[sourceName].childLookup = { "E92000001": [] }
    
    this.data[sourceName].parents = sourceConfig.parents.map(key=>({key,code}))
    let parentCt={};
    this.data[sourceName].parents.forEach(p => parentCt[p.key] = {});

    arr.forEach(d=>{
      this.data[sourceName].lookup[d[code]]=d;
      this.data[sourceName].geojson.features.push({
        type: 'Feature',
        properties: { areacd: d[code] },
        geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      })
      
      this.data[sourceName].parents.forEach(p=>{

        if (!parentCt[p.key][d[p.code]]) {
          parentCt[p.key][d[p.code]] = 1;
          this.data[sourceName].childLookup[d[p.code]] = [d[code]];
        } else {
          parentCt[p.key][d[p.code]] += 1;
          this.data[sourceName].childLookup[d[p.code]].push(d[code]);
        }
      })
      if (d[code][0] === "E") this.data[sourceName].childLookup["E92000001"].push(d[code]);
    })

    this.data[sourceName].parents.forEach(p => this.data[sourceName][`${p.key}_count`] = parentCt[p.key]);
  }

  // ... other methods like contains, parent, expand, bounds (implementation adjusted to handle multiple sources)

  expand(codes,geo) {
    return Array.isArray(codes) ?
      codes.map(c => this.data[geo].childLookup[c] ? this.data[geo].childLookup[c] : c).flat() :
      this.data[geo].childLookup[codes] ? this.data[geo].childLookup[codes] : [];
  }

  bounds(oas,geo) {
    // get a boundary for a list of OA codes
    let points = {
      type: 'GeometryCollection',
      geometries: oas.map(oa => {
        let d = this.data[geo].lookup[oa];
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

  // exists(oa) {
  //   return this.lookup[oa] ? true : false;
  // }

  contains(geo) {
    // Returns OA codes within the coordinates of a Polygon/MultiPolygon
    let bounds = bbox(geo);
    bounds = bboxPoly(bounds);

    let oas = inPoly(this.data['oa'].geojson, bounds);
    oas = inPoly(oas, geo).features.map(oa => oa.properties[boundaries.idKey]);
    let lsoas = inPoly(this.data['lsoa'].geojson, bounds);
    lsoas = inPoly(lsoas, geo).features.map(lsoa => lsoa.properties[lsoaBoundaries.idKey]);

    return { bbox: bounds, oa: new Set(oas), lsoa: new Set(lsoas) };
  }

  compress(oaAll) {
    let all = {};
    let compressed = [];
    all[this.key] = oaAll;
    this.data['oa'].parents.forEach(p => {
      all[p.key] = oaAll.map(oa => this.data['oa'].lookup[oa][p.code]);
    });
    const keys = Object.keys(all).reverse();
    for (let i = 0; i < oaAll.length; i++) {
      if (parents.every(p => !compressed.includes(all[p.key][i]))) {
        for (let j = 0; j < keys.length; j++) {
          let thiskey = keys[j];
          if (j === keys.length - 1) {
            compressed.push(all[thiskey][i]);
          } else if (
            all[thiskey].filter(cd => all[thiskey][i] === cd).length ===
            this.data['oa'][`${thiskey}_count`][all[thiskey][i]]
          ) {
            compressed.push(all[thiskey][i]);
            break;
          }
        }
      }
    }
    return compressed;
  }

  async simplify(
    name = '',
    selected,
    mapObject
  ) {
    const oaAll = Array.from(selected[key]);

    // compress the codes
    const compressed = this.compress(oaAll);
    const bbox = this.bounds(oaAll);
    var merge = {};
    merge.properties = {
      name,
      // bbox,
      compressed,
      oaAll,
      original: oaAll.length,
    };
    /// geo

    // move map to selection
    mapObject.fitBounds(bbox, { padding: 0, animate: false });

    merge.geojson = selected.geo

    // don't need these two bit below, just make merge.geojson=selected.geo
    // merge.geojson = await new Promise(resolve => mapObject.once("idle", () => {
    //   var geometry = mapObject
    //     .queryRenderedFeatures({ layers: ['bounds'] })
    //     .filter(e => selected[key].has(e.properties[boundaries.idKey]));

    //   let geojson = {
    //     type: 'FeatureCollection',
    //     features: geometry.map(f => {
    //       return {
    //         type: f.type,
    //         geometry: f.geometry,
    //       };
    //     })
    //   };

    //   let len = geojson.features.length;
    //   if (len > 1 && len < 75) geojson = buffer(geojson, 10, { units: 'meters' });
    //   let dissolved = dissolve(geojson);

    //   if (len > 1 && len < 75) dissolved = buffer(dissolved, -10, { units: 'meters' });
    //   dissolved.geometry.coordinates = roundAll(dissolved.geometry.coordinates, 6);

    //   let areaSqm = area(dissolved);
    //   filterGeo(dissolved, areaSqm);
    //   resolve(dissolved);
    // }));

    // console.debug ('---merge---', merge);
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

  population(oa) {
    return this.lookup[oa].population;
  }
}

// asynchronous factory function
export async function GetCentroids(sourceConfigs) {
  const c = new Centroids(sourceConfigs);
  await c.initialize();
  return c;
}

// async initialize() {
  //   let res = await fetch(points.url);
  //   let arr = decompressData(await res.json(), (columnData, rowNumber) => ({
  //     oa21cd: columnData[0][rowNumber],
  //     lsoa21cd: columnData[1][rowNumber],
  //     msoa21cd: columnData[2][rowNumber],
  //     ltla21cd: columnData[3][rowNumber],
  //     rgn21cd: columnData[4][rowNumber],
  //     lng: columnData[5][rowNumber],
  //     lat: columnData[6][rowNumber],
  //     population: columnData[7][rowNumber]
  //   }));

  //   let gjson = { type: 'FeatureCollection', features: [] };
  //   let lkp = {};
  //   let parentCt = {};
  //   let childLookup = { "E92000001": [] };
  //   parents.forEach(p => parentCt[p.key] = {});

  //   arr.forEach(d => {
  //     lkp[d[code]] = d;
  //     gjson.features.push({
  //       type: 'Feature',
  //       properties: { areacd: d[code] },
  //       geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
  //     });

  //     parents.forEach(p => {
  //       if (!parentCt[p.key][d[p.code]]) {
  //         parentCt[p.key][d[p.code]] = 1;
  //         childLookup[d[p.code]] = [d[code]];
  //       } else {
  //         parentCt[p.key][d[p.code]] += 1;
  //         childLookup[d[p.code]].push(d[code]);
  //       }
  //     });
  //     if (d[code][0] === "E") childLookup["E92000001"].push(d[code]);
  //   });

  //   this.sizes = arr.map(d => d.r);
  //   this.geojson = gjson;
  //   this.lookup = lkp;
  //   this.childLookup = childLookup;
  //   parents.forEach(p => this[`${p.key}_count`] = parentCt[p.key]);
  // }

  // parent(oa) {
  //   // Return immediate parents for OAs
  //   if (typeof oa === 'string') {
  //     return this.lookup[oa][parents[0].code];
  //   } else {
  //     return oa.map(cd => this.lookup[cd][parents[0].code]);
  //   }
  // }

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