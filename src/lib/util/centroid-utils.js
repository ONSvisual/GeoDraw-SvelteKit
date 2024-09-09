import bbox from '@turf/bbox';
import bboxPoly from '@turf/bbox-polygon';
import inPoly from '@turf/points-within-polygon';
// import buffer from '@turf/buffer';
// import area from '@turf/area';
import { decompressData } from "compress-csv-to-json";
// import { dissolve } from '$lib/util/bundled/mapshaper';
// import { roundAll } from '$lib/util/functions';
import { boundaries, lsoaBoundaries } from '$lib/config/geography';

class Centroids {
  constructor(sourceConfigs){
    this.sourceConfigs = sourceConfigs;
    this.data = {}; // Store fetched data for each source
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
    try{
      const res = await fetch(sourceConfig.url);
      if (!res.ok) {
        throw new Error(`Failed to fetch data from ${sourceConfig.url}: ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Re-throw the error to handle it at a higher level
    }
    
  }

  _processDataForSource(sourceConfig, data, sourceName) {
    // ... data processing logic
    const arr = decompressData(data, sourceConfig.decompressFunc)
    const key = sourceConfig.key
    this.data[sourceName].year = String(sourceConfig.year).slice(2)
    const code = `${key}${this.data[sourceName].year}cd`;

    this.data[sourceName].geojson = { type: 'FeatureCollection', features: [] };
    this.data[sourceName].lookup = {}
    this.data[sourceName].childLookup = { "E92000001": [] }
    
    this.data[sourceName].parents = sourceConfig.parents.map(key => {
      const code = `${key}${this.data[sourceName].year}cd`;
      return { key, code };
    });
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

  compress(codes,geo) {
    let all = {};
    let compressed = [];
    all[geo] = codes;

    this.data[geo].parents.forEach(p => {
      all[p.key] = codes.map(area => this.data[geo].lookup[area][p.code]);
    });

    const keys = Object.keys(all).reverse();
    for (let i = 0; i < codes.length; i++) {
      if (this.data[geo].parents.every(p => !compressed.includes(all[p.key][i]))) {
        for (let j = 0; j < keys.length; j++) {
          let thiskey = keys[j];
          if (j === keys.length - 1) {
            compressed.push(all[thiskey][i]);
          } else if (
            all[thiskey].filter(cd => all[thiskey][i] === cd).length ===
            this.data[geo][`${thiskey}_count`][all[thiskey][i]]
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
    console.log(selected)
    const oaAll = Array.from(selected['oa']);
    const lsoaAll = Array.from(selected['lsoa']);
    // compress the codes
    const compressed = this.compress(oaAll,'oa');
    // Filter compressed to strip out OAs
    const compressedToLsoa = this.compress(lsoaAll,'lsoa');
    const bbox = this.bounds(oaAll,'oa');
    var merge = {};
    merge.properties = {
      name,
      // bbox,
      compressed,
      compressedToLsoa,
      oaAll,
      original: oaAll.length,
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

  population(oa) {
    return this.data['oa'].lookup[oa].population;
  }
}

// asynchronous factory function
export async function GetCentroids(sourceConfigs) {
  const c = new Centroids(sourceConfigs);
  await c.initialize();
  return c;
}
