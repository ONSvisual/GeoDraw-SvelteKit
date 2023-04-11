// import pako from 'pako'
import {csvParse, autoType} from 'd3-dsv';
import bbox from '@turf/bbox';
import bboxPoly from '@turf/bbox-polygon';
import inPoly from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import area from '@turf/area';
import {dissolve} from '$lib/util/mapshaper';
import {roundAll} from './misc-utils';
import {points, boundaries} from '$lib/config/geography';

const key = points.key;
const code = `${points.key}${String(points.year).slice(2)}cd`;
const parents = points.parents.map(key => ({
  key,
  code: `${key}${String(points.year).slice(2)}cd`
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
    let res = await fetch (points.url);
    let arr = csvParse (await res.text (), autoType);

    let gjson = {type: 'FeatureCollection', features: []};
    let lkp = {};
    let parent_ct = {};
    parents.forEach(p => parent_ct[p.key] = {});

    arr.forEach (d => {
      lkp[d[code]] = d;
      gjson.features.push ({
        type: 'Feature',
        properties: {areacd: d[code]},
        geometry: {type: 'Point', coordinates: [d.lng, d.lat]},
      });

      parents.forEach(p => {
        if (!parent_ct[p.key][d[p.code]]) {
          parent_ct[p.key][d[p.code]] = 1;
        } else {
          parent_ct[p.key][d[p.code]] += 1;
        }
      });
    });

    this.sizes = arr.map (d => d.r);
    this.geojson = gjson;
    this.lookup = lkp;
    parents.forEach(p => this[`${p.key}_count`] = parent_ct[p.key]);
  }

  // geojson () {
  //   return this.geojson;
  // }

  parent (oa) {
    // Return immediate parents for OAs
    if (typeof oa === 'string') {
      return this.lookup[oa][parents[0].code];
    } else {
      return oa.map (cd => this.lookup[cd][parents[0].code]);
    }
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
    console.log(points.geometries, bounds)
    bounds = [bounds[0] - 0.04, bounds[1] - 0.04, bounds[2] + 0.04, bounds[3] + 0.04];
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

  compress (oa_all) {
    let all = {};
    let compressed = [];
    all[key] = oa_all;
    parents.forEach(p => {
      all[p.key] = oa_all.map(oa => this.lookup[oa][p.code]);
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
      if (len > 1 && len < 50) geojson = buffer(geojson, 10, {units: 'meters'});
      let dissolved = dissolve (geojson);

      if (len > 1 && len < 50) dissolved = buffer(dissolved, -10, {units: 'meters'});
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
}

// asynchronous factory function
export async function GetCentroids (kwargs) {
  const c = new Centroids ();
  await c.initialize (kwargs);
  return c;
}