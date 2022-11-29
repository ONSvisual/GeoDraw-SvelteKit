// import pako from 'pako'
import {csvParse, autoType} from 'd3-dsv';
import bbox from '@turf/bbox';
import bboxPoly from '@turf/bbox-polygon';
import inPoly from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import area from '@turf/area';
import {dissolve} from '$lib/mapshaper';
import {roundAll} from './misc_utils';
const url = 'https://cdn.ons.gov.uk/maptiles/cp-geos/v1/oa21-data.csv';

//'/oa21-data-v4.csv'


function u(x){
  return [...new Set(x)]
}


class Centroids {
  async initialize () {
    let res = await fetch (url);
    let arr = csvParse (await res.text (), autoType);

    let gjson = {type: 'FeatureCollection', features: []};
    let lkp = {};
    let lsoa_ct = {};
    let msoa_ct = {};
    arr.forEach (d => {
      lkp[d.oa21cd] = d;
      gjson.features.push ({
        type: 'Feature',
        properties: {areacd: d.oa21cd},
        geometry: {type: 'Point', coordinates: [d.lng, d.lat]},
      });

      if (!lsoa_ct[d.lsoa21cd]) {
        lsoa_ct[d.lsoa21cd] = 1;
      } else {
        lsoa_ct[d.lsoa21cd] += 1;
      }

      if (!msoa_ct[d.msoa21cd]) {
        msoa_ct[d.msoa21cd] = 1;
      } else {
        msoa_ct[d.msoa21cd] += 1;
      }
    });

    this.sizes = arr.map (d => d.r);
    this.geojson = gjson;
    this.lookup = lkp;
    this.lsoa_count = lsoa_ct;
    this.msoa_count = msoa_ct;
  }

  // geojson () {
  //   return this.geojson;
  // }

  parent (oa) {
    // Return LSOA parents for OAs
    if (typeof oa === 'string') {
      return this.lookup[oa].lsoa21cd;
    } else {
      return oa.map (cd => this.lookup[cd].lsoa21cd);
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
    bounds = [bounds[0] - 0.02, bounds[1] - 0.02, bounds[2] + 0.02, bounds[3] + 0.02];
    console.log("bounds", bounds);
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
    oas = inPoly (oas, geo).features.map (oa => oa.properties.areacd);

    return {bbox: bounds, oa: new Set (oas)};
  }

  compress (oa_all) {
    const lsoa_all = oa_all.map (oa => this.lookup[oa].lsoa21cd);
    const msoa_all = oa_all.map (oa => this.lookup[oa].msoa21cd);
    let oa = [];
    let lsoa = [];
    let msoa = [];
    for (let i = 0; i < oa_all.length; i++) {
      if (!msoa.includes (msoa_all[i]) && !lsoa.includes (lsoa_all[i])) {
        if (
          msoa_all.filter (msoa => msoa_all[i] == msoa).length ==
          this.msoa_count[msoa_all[i]]
        ) {
          msoa.push (msoa_all[i]);
        } else if (
          lsoa_all.filter (lsoa => lsoa_all[i] == lsoa).length ==
          this.lsoa_count[lsoa_all[i]]
        ) {
          lsoa.push (lsoa_all[i]);
        }
        else {
          oa.push(oa_all[i])
        }
      }
    }
    console.warn('ssss', {oa,lsoa,msoa,oa_all});
    return {oa, lsoa, msoa};
  }

  async simplify (
    name = 'Enter Area Name',
    selected,
    mapobject
    // options = {simplify_geo: false},
  ) {
    const oa_all = Array.from (selected.oa);

    // compress the codes
    let {oa, lsoa, msoa} = this.compress(oa_all);

    // oa = u(oa)
    // msoa = u(msoa)
    // lsoa = u(lsoa)


    
    const bbox = this.bounds (oa_all);



    var merge = {};
    merge.properties = {
      name,
      // bbox,
      oa,
      lsoa,
      msoa,
      oa_all,
      original: oa_all.length,
    };
    /// geo

    // move map to selection
    mapobject.fitBounds (bbox, {padding: 0, animate: false});

    merge.geojson = await new Promise(resolve => mapobject.once("idle", () => {
      var geometry = mapobject
        .queryRenderedFeatures ({layers: ['bounds']})
        .filter (e => selected.oa.has (e.properties.areacd));

      let geojson = {
        type: 'FeatureCollection',
        features: geometry.map(f => {
          return {
            type: f.type,
            geometry: f.geometry,
          };
        })
      };

      if (geojson.features.length < 20) geojson = buffer(geojson, 10, {units: 'meters'});
      let dissolved = dissolve (geojson, area_sqm);
      if (geojson.features.length < 20) dissolved = buffer(dissolved, -10, {units: 'meters'});
      // let area_sqm = area(geojson);
      dissolved.geometry.coordinates = roundAll(dissolved.geometry.coordinates, 6);

      console.debug ('---merge---', merge);

      resolve(dissolved);
    }));

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

//   module.exports = {
//     GetCentroids
//   };

// Object.fromEntries(a.$index.map((_, i) => [_, a.$data[i]]))
