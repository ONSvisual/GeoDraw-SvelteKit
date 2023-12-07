import bbox from '@turf/bbox';
import bboxPoly from '@turf/bbox-polygon';
import inPoly from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import area from '@turf/area';
import {decompressData} from "compress-csv-to-json";
import {dissolve} from '$lib/util/mapshaper';
import {roundAll} from '$lib/util/functions';
import {points, boundaries, lookup11, lookup21_11} from '$lib/config/geography';

const key = points.key;
const code = `${points.key}${String(points.year).slice(2)}cd`;
const parents = points.parents.map(key => ({
  key,
  code: `${key}${String(points.year).slice(2)}cd`
}));
const parents11 = points.parents.map(key => ({
  key,
  code: `${key}11cd`
}));

// Take a geojson feature (Polygon or MultiPolygon) and remove polygon rings smaller than a given area
function filterGeo(geojson, area_sqm) {
  const filterByArea = (coords) => area({type: "Polygon", coordinates: [coords]}) > (area_sqm / 1000);
  if (geojson.geometry.type === "Polygon") {
    geojson.geometry.coordinates = geojson.geometry.coordinates.filter(coords => filterByArea(coords));
  }
  if (geojson.geometry.type === "MultiPolygon") {
    geojson.geometry.coordinates.forEach((poly, i) => {
      geojson.geometry.coordinates[i] = poly.filter(coords => filterByArea(coords));
    });
    geojson.geometry.coordinates = geojson.geometry.coordinates.filter(coords => coords[0]);
  }
}


class Centroids {
  async initialize () {
    let arr = decompressData (await (await fetch (points.url)).json (), (columnData, rowNumber) => ({
      lsoa21cd: columnData[0][rowNumber],
      msoa21cd: columnData[1][rowNumber],
      ltla21cd: columnData[2][rowNumber],
      rgn21cd: columnData[3][rowNumber],
      lng: columnData[4][rowNumber],
      lat: columnData[5][rowNumber],
      population: columnData[6][rowNumber]
    }));

    let gjson = {type: 'FeatureCollection', features: []};
    let lkp = {};
    let parent_ct = {};
    let child_lookup = {"E92000001": []};
    let region_lookup = {};+
    parents.forEach(p => parent_ct[p.key] = {});

    for (const d of arr) {
      lkp[d[code]] = d;
      region_lookup[d[code]] = d.rgn21cd;

      gjson.features.push ({
        type: 'Feature',
        properties: {areacd: d[code]},
        geometry: {type: 'Point', coordinates: [d.lng, d.lat]},
      });

      for (const p of parents) {
        if (!parent_ct[p.key][d[p.code]]) {
          parent_ct[p.key][d[p.code]] = 1;
          child_lookup[d[p.code]] = [d[code]];
          region_lookup[d[p.code]] = d.rgn21cd;
        } else {
          parent_ct[p.key][d[p.code]] += 1;
          child_lookup[d[p.code]].push(d[code]);
        }
      }
      if (d[code][0] === "E") child_lookup["E92000001"].push(d[code]);
    }

    // this.sizes = arr.map (d => d.r);
    this.geojson = gjson;
    this.lookup = lkp;
    this.child_lookup = child_lookup;
    parents11.forEach(p => this[`${p.key}_count`] = parent_ct[p.key]);

    let lkp11 = {};
    let parent11_ct = {};
    let child11_lookup = {"E92000001": []};
    parents11.forEach(p => parent11_ct[p.key] = {});

    let arr11 = decompressData (await (await fetch(lookup11)).json (), (columnData, rowNumber) => ({
      lsoa11cd: columnData[0][rowNumber],
      msoa11cd: columnData[1][rowNumber],
      ltla11cd: columnData[2][rowNumber],
      rgn11cd: columnData[3][rowNumber]
    }));

    arr11.forEach (d => {
      const cd = d.lsoa11cd;
      lkp11[cd] = d;
      region_lookup[cd] = d.rgn11cd;

      parents11.forEach(p => {
        if (!parent11_ct[p.key][d[p.code]]) {
          parent11_ct[p.key][d[p.code]] = 1;
          child11_lookup[d[p.code]] = [cd];
          region_lookup[d[p.code]] = d.rgn11cd;
        } else {
          parent11_ct[p.key][d[p.code]] += 1;
          child11_lookup[d[p.code]].push(cd);
        }
      });
    });

    this.lookup11 = lkp11;
    this.lookup21_11 = await (await fetch (lookup21_11)).json();
    this.child11_lookup = child11_lookup;
    parents11.forEach(p => this[`${p.key}11_count`] = parent11_ct[p.key]);
    this.region_lookup = region_lookup;
  }

  parent (oa) {
    // Return immediate parents for OAs
    if (typeof oa === 'string') {
      return this.lookup[oa][parents[0].code];
    } else {
      return oa.map (cd => this.lookup[cd][parents[0].code]);
    }
  }

  expand (codes, yr = 21) {
    const lookup = this[`child${yr === 21 ? "" : yr}_lookup`];
    return Array.isArray(codes) ?
      codes.map(c => lookup[c] || c).flat() :
      lookup[codes] || [];
  }

  bounds (oas) {
    // get a boundary for a list of OA codes
    let points = {
      type: 'GeometryCollection',
      geometries: oas.map(oa => {
        let d = this.lookup[oa];
        return {
          type: 'Point',
          coordinates: [d.lng, d.lat]
        }
      })
    };
    let bounds = bbox (points);
    bounds = [bounds[0] - 0.01, bounds[1] - 0.01, bounds[2] + 0.01, bounds[3] + 0.01];
    // console.log("bounds", bounds);
    return bounds;
  }

  exists (oa) {
    return this.lookup[oa] ? true : false;
  }

  contains (geo) {
    // Returns OA codes within the coordinates of a Polygon/MultiPolygon
    let bounds = bbox (geo);
    bounds = bboxPoly (bounds);

    let oas = inPoly (this.geojson, bounds);
    oas = inPoly (oas, geo).features.map (oa => oa.properties[boundaries.id_key]);

    return {bbox: bounds, oa: new Set (oas)};
  }

  compress (oa_all, yr = 21) {
    let all = {};
    let compressed = [];
    all[key] = oa_all;
    parents.forEach(p => {
      all[p.key] = oa_all.map(oa => this[`lookup${yr === 21 ? '' : yr}`][oa][`${p.key}${yr}cd`]);
    });
    const keys = Object.keys(all).reverse();
    for (let i = 0; i < oa_all.length; i++) {
      if (parents.every(p => !compressed.includes(all[p.key][i]))) {
        for (let j = 0; j < keys.length; j ++) {
          let thiskey = keys[j];
          if (j === keys.length - 1) {
            compressed.push(all[thiskey][i]);
          } else if (
            all[thiskey].filter(cd => all[thiskey][i] === cd).length ===
            this[`${thiskey}${yr === 21 ? '' : yr}_count`][all[thiskey][i]]
          ) {
            compressed.push(all[thiskey][i]);
            break;
          }
        }
      }
    }
    // console.log("compressed", compressed);
    return compressed;
  }

  convert (oa_all) {
    return oa_all.map(oa => this.lookup21_11[oa] || [oa]).flat();
  }

  comp2comp (oa_comp) {
    if (oa_comp.every(oa => this.lookup11[oa] || this.child11_lookup[oa])) return oa_comp;
    return this.compress(this.convert(this.expand(oa_comp)), 11);
  }

  async simplify (
    name = '',
    selected,
    mapobject
    // options = {simplify_geo: false},
  ) {
    const oa_all = Array.from (selected.oa);

    // compress the codes
    const compressed = this.compress(oa_all);
    const bbox = this.bounds(oa_all);
    var merge = {};
    merge.properties = {
      name,
      // bbox,
      compressed,
      oa_all,
      original: oa_all.length,
    };
    /// geo

    // move map to selection
    mapobject.fitBounds (bbox, {padding: 0, animate: false});

    merge.geojson = await new Promise(resolve => mapobject.once("idle", () => {
      var geometry = mapobject
        .queryRenderedFeatures ({layers: ['bounds']})
        .filter (e => selected.oa.has(e.properties[boundaries.id_key]));

      let geojson = {
        type: 'FeatureCollection',
        features: geometry.map(f => {
          return {
            type: f.type,
            geometry: f.geometry,
          };
        })
      };

      let len = geojson.features.length;
      if (len > 1 && len < 75) geojson = buffer(geojson, 10, {units: 'meters'});
      let dissolved = dissolve (geojson);

      if (len > 1 && len < 75) dissolved = buffer(dissolved, -10, {units: 'meters'});
      dissolved.geometry.coordinates = roundAll(dissolved.geometry.coordinates, 6);
      
      let area_sqm = area(dissolved);
      filterGeo(dissolved, area_sqm);
      resolve(dissolved);
    }));

    // console.debug ('---merge---', merge);
    return merge;
  }

  ////////////////////////
  // generic function defs
  ////////////////////////
  getbbox (coords) {
    var lat = coords.map (p => +p[1]);
    var lng = coords.map (p => +p[0]);

    var min_coords = [Math.min.apply (null, lng), Math.min.apply (null, lat)];
    var max_coords = [Math.max.apply (null, lng), Math.max.apply (null, lat)];

    return [min_coords, max_coords];
  }

  population (oa) {
    return this.lookup[oa].population;
  }

  region (oa) {
    return this.region_lookup[oa];
  }
}

// asynchronous factory function
export async function GetCentroids (kwargs) {
  const c = new Centroids ();
  await c.initialize (kwargs);
  return c;
}