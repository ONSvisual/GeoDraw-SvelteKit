import { get } from 'svelte/store';
import {
  mapobject,
  radiusInKm,
  draw_type,
  selected,
  add_mode,
  draw_enabled,
  query,
  server,
} from './mapstore.js';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
// import {extent} from 'd3-array';
import { bboxToTile } from '@mapbox/tilebelt';
// import { LngLat, LngLatBounds} from 'maplibre-gl';
// turf does not compile with sveltekit
import { default as union } from '@turf/union';
import { draw } from 'svelte/transition';

var simplify = {};
export var Draw;

// import {LngLatBounds} from "maplibre-gl";
export let coordinates = [];

////////////////////
///////////////////

export async function init_draw() {
  get(mapobject).addSource('drawsrc', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
  });

  get(mapobject).addLayer({
    id: 'draw_layer',
    // type: 'line',
    type: 'fill',
    source: 'drawsrc',
    // paint: {
    //   'line-color': '#222',
    //   'line-width': 5,
    //   'line-dasharray': [2, 1],
    // },
    paint: {
      'fill-color': 'coral',
      'fill-opacity': 0.5,

    }
  });

  get(mapobject).addLayer({
    id: 'circle_layer',
    type: 'circle',
    source: 'drawsrc',
    paint: {
      'circle-radius': {
        base: 2,
        stops: [[0, 0], [22, 180]],
      },
      'circle-color': 'coral',
      'circle-opacity': 0.5,
      // 'stroke-color': '#222',
      // 'stroke-width': 2,
      // 'stroke-opacity': 0.5,
      // 'stroke-dasharray': [2, 4],
    },
  });


  Draw = new MapboxDraw(
    {
      draw: ["draw_polygon"], 
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false
      },
      userProperties: true,
      // styles: [{
      //   'id': 'gl-draw-polygon-fill',
      //   'type': 'fill',
      //   'paint': {
      //     'fill-color': "#222",
      //     'fill-outline-color': '#222',
      //     'fill-opacity': 0.5,
      //     'fill-outline-dasharray': [2, 4],

      //   }
      // }]

    });
  
  get(mapobject).addControl(Draw, 'top-right');


  get(mapobject).on('draw.selectionchange', drawPoly);
  Draw.deleteAll()

  async function  drawPoly(e) {
    var data = Draw.getAll();
    var coords = await data.features[0].geometry.coordinates[0]
    console.log(data,coords)
    
    update(coords)
    clearpoly();
  }
  

  // clear coordinates each time we change
  draw_type.subscribe((dt) => {
    coordinates = [];
    add_mode.set(true);
    circle_paint((clear = get(draw_type) != 'radius'));
    Draw.deleteAll();
    // console.warn(dt)
    if (dt==='polygon') Draw.changeMode('draw_polygon', {})

  });


  // set default
  draw_type.set('radius');
  // update circle tool each radius change
  radiusInKm.subscribe(circle_paint);

  get(mapobject).on('click', 'bounds', function boundclick(e) {
    switch (get(draw_type)) {
      case 'radius':
        draw_radius(e.lngLat);
        // circle_fast (e.lngLat);
        break;
      // case 'polygon':
      //   draw_polygon(e.lngLat);
      //   break;
      case 'select':
        draw_point(e);
        break;
    }
  });

  get(mapobject).on('zoomend', function () {
    draw_enabled.set(get(mapobject).getZoom() < 10);
  });

  // on move events
  get(mapobject).on('mousemove', 'bounds', function move(e) {
    // console.log (e.lngLat, get (draw_type));

    if (get(draw_type) == 'radius') circle_fast(e.lngLat)

    // switch (get(draw_type)) {
    //   case 'radius':
    //     circle_fast(e.lngLat);
    //     break;
    // case 'polygon':
    // polygon_fast(e.lngLat);
    // break;
    // case 'click':
    // break;
    // }
  });
}
/// UPDATE FUNCTIONS
// function update_area (callback) {
//   // if (!coordinates) return;
//   var query;
//   coordinates = callback.detail.code;
//   console.error (callback);
// }

// export function savepoly() {
//   var co = {
//     lng: coordinates[0][0],
//     lat: coordinates[0][1],
//   }
//   console.warn('savetrigger', co)
//   // get(mapobject).fire('click', co)
//   draw_polygon(co)

// };



function clear() {
  coordinates = [];
  change_data('drawsrc', {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [],
    }

  })
}

export function clearpoly() {
  // clear()
  Draw.deleteAll();
  Draw.changeMode('draw_polygon', {});
}

export function change_data(layer, data) {
  get(mapobject).getSource(layer).setData(data);
}

////////////////////
// Click Tool
////////////////////

////////////////////
// Matching Utilities
////////////////////

export function update(coordinates) {
  // update the selection

  const bbox = getbbox(coordinates);


  console.error('bb',bbox)


  const features = get(mapobject).queryRenderedFeatures(
    bbox.map(d => get(mapobject).project(d)),
    { layers: ['centroids'] }
  );

  console.error('---features', features);
  const oa = features
    .filter(i => inPolygon(coordinates, i.geometry.coordinates))
    .map(d => d.properties.id);

  var current = get(selected);
  var last = current[current.length - 1];

  bbox.map(d => {
    last.lat.push(d[1]);
    last.lng.push(d[0]);
  });

  // get (mapobject).fitBounds (bbox);

  if (get(add_mode)) {
    current.push({
      oa: new Set([...last.oa, ...oa]),
      lng: extent(last.lng),
      lat: extent(last.lat),
    });
  } else {
    current.push({
      oa: new Set([...last.oa].filter(x => !new Set(oa).has(x))),
      lng: extent(last.lng),
      lat: extent(last.lat),
    });
  }

  var items = current[current.length - 1];
  // we cannot strigify sets....
  // items.oa = [...items.oa]
  items = JSON.stringify(
    items,
    (_key, value) => (value instanceof Set ? [...value] : value)
  );
  localStorage.setItem('draw_data', items);

  selected.set(current);
}

function draw_point(e) {
  const oalist = new Set(e.features.map(d => d.properties.oa));
  const current = get(selected);
  var last = Object.assign({}, current[current.length - 1]);

  last.lat.push(e.lngLat.lat);
  last.lng.push(e.lngLat.lng);
  last = {
    oa: new Set(last.oa),
    lat: extent(last.lat),
    lng: extent(last.lng),
  };

  // console.log('--clicked',oalist,last);
  [...oalist].forEach(
    oa => (last.oa.has(oa) ? last.oa.delete(oa) : last.oa.add(oa))
  );

  current.push(last);
  selected.set(current);
}

function inPolygon(polygon, point) {
  // check if existing

  if (!polygon.length) return false;
  var n = polygon.length,
    p = polygon[n - 1],
    [x, y] = point,
    [x0, y0] = p,
    x1,
    y1,
    inside = false;

  for (var i = 0; i < n; ++i) {
    (p = polygon[i]), (x1 = p[0]), (y1 = p[1]);
    if (y1 > y !== y0 > y && x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)
      inside = !inside;
    (x0 = x1), (y0 = y1);
  }

  return inside;
}

function geomean(c1, c2, thresh = 30) {
  c1 = get(mapobject).project(c1);
  c2 = get(mapobject).project(c2);

  return Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2) < thresh;
}

function getbbox(coords) {
  var lat = coords.map(p => p[1]);
  var lng = coords.map(p => p[0]);

  var min_coords = [Math.min.apply(null, lng), Math.min.apply(null, lat)];
  var max_coords = [Math.max.apply(null, lng), Math.max.apply(null, lat)];

  return [min_coords, max_coords];
}

////////////////////
// Circle Tools
////////////////////

function draw_radius(center, points = 20) {
  // if(!points) points = 64;
  var coords = {
    latitude: center.lat,
    longitude: center.lng,
  };

  // clear ();

  var km = get(radiusInKm) / 2;

  var coordinates = [];
  var distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
  var distanceY = km / 110.574;

  var theta, x, y;
  for (var i = 0; i < points; i++) {
    theta = i / points * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);
    coordinates.push([coords.longitude + x, coords.latitude + y]);
  }
  coordinates.push(coordinates[0]);
  update(coordinates);
}

/// Fast Circle on-move Function
function circle_fast(center) {
  var geo = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [center.lng, center.lat],
    },
  };
  change_data('drawsrc', geo);
  return geo;
}

/// Scale Calulation Function.
function circle_paint(clear = false) {
  console.warn('-circle', clear);
  if (mapobject) {
    if (clear == true) {
      return get(mapobject).setPaintProperty(
        'circle_layer',
        'circle-radius',
        5
      );
    }

    const m2p = (meters, latitude) =>
      meters / 0.075 / Math.cos(latitude * Math.PI / 180);

    get(mapobject).setPaintProperty('circle_layer', 'circle-radius', {
      base: 2,
      stops: [
        [0, 0],
        [22, m2p(get(radiusInKm) * 2000, get(mapobject).getCenter().lat)],
      ],
    });
  }
}

////////////////////
// Polygon
////////////////////

// function draw_polygon(e) {
//   // console.warn('dp',e)
//   if (coordinates.length) {
//     if (geomean(coordinates[0], [e.lng, e.lat])) {
//       // if we close the polygon
//       coordinates.push(coordinates[0]);

//       update(coordinates);

//       console.log('--saving polygon', get(selected));

//       coordinates = [];
//       // clear ();
//       return 1;
//     }
//   }

//   coordinates.push([e.lng, e.lat]);

//   var geo = {
//     type: 'Feature',
//     geometry: {
//       type: 'Polygon',
//       coordinates: [coordinates],
//     },
//   };
//   console.error(geo);
//   change_data('drawsrc', geo);
// }

// function polygon_fast(e) {
//   var temp = [...coordinates, [e.lng, e.lat]];
//   var geo = {
//     type: 'Feature',
//     geometry: {
//       type: 'Polygon',
//       coordinates: [temp],
//     },
//   };
//   change_data('drawsrc', geo);
// }

////////////////////
// Query
////////////////////

export async function simplify_query() {
  /* A function using the bounding box to query the database and return the simplified polygons */

  const last = get(selected)[get(selected).length - 1];
  // get parent tile from drawing bounding box
  const bbox = [last.lng[0], last.lat[0], last.lng[1], last.lat[1]];
  const [x, y, z] = bboxToTile(bbox);
  if (z === 28) return null;

  var tile = `${z}/${x}/${y}`;

  if (z < 7)
    return {
      error_title: 'Total area selected exceeds allowed limit. Please use the undo button to reduce area size.',
      error: `Parent Data Tile ${tile}`,
    };

  // get the data from the tile
  if (simplify[tile]) {
    var simple = simplify[tile];
  } else {
    var simple = await fetch(`${server}/encoding/${tile}.json`).then(d =>
      d.json()
    );
    simple.lsoa = simple.lsoa.map(d => {
      d[1] = new Set(d[1]);
      return d;
    });
    simple.msoa = simple.msoa.map(d => {
      d[1] = new Set(d[1]);
      return d;
    });
    simplify[tile] = simple;
  }

  // simplify the query
  var rm = [];
  var oa = last.oa;
  var lsoa = simple.lsoa.filter(
    d => ![...d[1]].filter(x => !oa.has(x)).length
  );
  lsoa = new Set(
    lsoa.map(e => {
      rm.push([...e[1]]);
      return e[0];
    })
  );
  var msoa = simple.msoa.filter(
    d => ![...d[1]].filter(x => !lsoa.has(x)).length
  );
  rm = new Set(rm.flat());
  var rmlsoa = new Set(msoa.map(d => d[1]).flat());
  oa = [...oa].filter(e => !rm.has(e));
  lsoa = [...lsoa].filter(e => !rmlsoa.has(e));
  msoa = msoa.map(d => d[0]);

  console.warn('lsoa', tile, msoa, oa, lsoa, last.oa);

  // return the simplified query - it would be quicker to not do this each change, but hey.
  get(mapobject).fitBounds(bbox, {
    padding: 200,
    animation: false,
    linear: true,
    duration: 200,
  });
  const oalist = [...last.oa];

  await new Promise(res => setTimeout(res, 500));

  const features = get(mapobject)
    .queryRenderedFeatures({
      layers: ['bounds'],
    })
    .filter(d => oalist.includes(d.properties.oa)); //.map(d=>d.properties.oa)

  console.warn(
    'features',
    features,
    get(mapobject).queryRenderedFeatures({
      layers: ['bounds'],
    })
  );

  if (!features.length) {
    return false;
  }

  let merge = features[0];
  for (let i = 1; i < features.length; i++) {
    merge = union(merge, features[i]);
  }

  merge.properties = { tile, msoa, oa, lsoa, original: oalist.length };
  console.log('---merge---', merge);

  // 2732 character

  return merge;
}

// function sliceencode(str){
//   const chunkSize = 10;
// for (let i = 0; i < array.length; i += chunkSize) {
//     const chunk = array.slice(i, i + chunkSize);
//     // do whatever
// }
// }

function extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }
  return [min, max];
}
