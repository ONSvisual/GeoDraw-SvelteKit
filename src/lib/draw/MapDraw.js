import { get } from 'svelte/store';
import {
  mapobject,
  radiusInKm,
  draw_type,
  selected,
  add_mode,
  draw_enabled,
  server,
} from './mapstore.js';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
// import {extent} from 'd3-array';
import { bboxToTile } from '@mapbox/tilebelt';
// import { LngLat, LngLatBounds} from 'maplibre-gl';
// turf does not compile with sveltekit
// import { default as union } from '@turf/union';
import circle from '@turf/circle';
import turf_simplify from '@turf/simplify';
import turf_bbox from '@turf/bbox';
import turf_inpolygon from '@turf/boolean-point-in-polygon';
import { dissolve } from 'https://cdn.jsdelivr.net/npm/mapshaper-with-patch@0.4.155/mapshaper.min.js';//'$lib/mapshaper';
// import { draw } from 'svelte/transition';

var simplify = {};
export var Draw;

// import {LngLatBounds} from "maplibre-gl";
export let coordinates = [];

// keep track of coordinates of centre of radius drawing tool
let radius_center = null;

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
    paint: {"fill-color":"#fbb03b","fill-outline-color":"#fbb03b","fill-opacity":.1}
  });

  get(mapobject).addLayer({
    id: 'draw_outline',
    type: 'line',
    source: 'drawsrc',
    layout:{"line-cap":"round","line-join":"round"},
	paint:{"line-color":"#fbb03b","line-dasharray":[.2,2],"line-width":2}
  });

  

//   get(mapobject).addLayer({
//     id: 'circle_layer',
//     type: 'circle',
//     source: 'drawsrc',
//     paint: {
//       'circle-radius': {
//         base: 0,
//         stops: [[0, 0], [22, 180]],
//       },
//       'circle-color': 'coral',
//       'circle-opacity': 0.5,
//       // 'stroke-color': '#222',
//       // 'stroke-width': 2,
//       // 'stroke-opacity': 0.5,
//       // 'stroke-dasharray': [2, 4],
//     },
//   });


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

  async function drawPoly(e) {
    var data = Draw.getAll();
    var coords = await data.features[0].geometry.coordinates[0];

    update(coords)
    clearpoly();
  }


  // clear coordinates each time we change
  draw_type.subscribe((dt) => {
    coordinates = [];
    add_mode.set(true);
    circle_fast((clear = get(draw_type) != 'radius'));
    Draw.deleteAll();
    // console.warn(dt)
    if (dt === 'polygon') Draw.changeMode('draw_polygon', {})

  });

  // set default
  radius_center = null;
  circle_fast((clear = true));
  draw_type.set('move');

  // update circle tool each radius change
  radiusInKm.subscribe(() => circle_fast());

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

    if (get(draw_type) == 'radius') circle_fast(false, e.lngLat)

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

function round(num, precision = 0) {
	const multiplier = Math.pow(10, precision);
	return Math.round(num * multiplier) / multiplier;
}

// Recursive function to round numbers in a multi-array (used to round coordinates)
function roundAll(arr, decimals) {
	let newarr = [];
	arr.forEach(d => {
		if (typeof d == "number") {
			newarr.push(round(d, decimals));
		} else if (Array.isArray(d)) {
			newarr.push(roundAll(d, decimals));
		} else {
			newarr.push(d);
		}
	});
	return newarr;
}

export function simplify_geo(geometry, max_length = 3000) {
  // Simplifies a geojson geometry
  let simple;
  let length = max_length;
  let precision = 5;

  while (length >= max_length && precision >= 2) {
    simple = turf_simplify(geometry, {highQuality: true, tolerance: Math.pow(10, -precision)});
    simple.coordinates = roundAll(simple.coordinates, Math.ceil(precision));
    length = JSON.stringify(simple).length;
    precision -= 0.5;
  }
  console.log('simplified polygon', `string length: ${length}, precision: ${precision}`);
  return simple;
}

function makeBoundary(geojson, simplify = false) {
	let dissolved = dissolve(geojson);

	let simple;
  if (simplify) {
    simple = simplify_geo(dissolved.geometry);
  } else {
    simple = dissolved.geometry;
    simple.coordinates = roundAll(simple.coordinates, 6);
  }
	
	return {type: 'Feature', geometry: simple};
}


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

  // Updated to allow for multipolygon inputs
  // This is not currently used, but should allow users to upload geojson polygons
  let bbox = coordinates.type ? turf_bbox(coordinates) : getbbox(coordinates);
  bbox = bbox.length == 4 ? [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] : bbox;

  console.error('bb', bbox)

  const features = get(mapobject).queryRenderedFeatures(
    bbox.map(d => get(mapobject).project(d)),
    { layers: ['centroids'] }
  );

  console.error('---features', features);
  const oa = coordinates.type ? 
    features
      .filter(i => turf_inpolygon(i, coordinates))
      .map(d => d.properties.id) :
    features
      .filter(i => inPolygon(coordinates, i.geometry.coordinates))
      .map(d => d.properties.id) ;

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

function draw_radius(center, points = 24) {
	console.log(center);
	const options = {steps: points, units: 'kilometers'};
	let geo = circle([center.lng, center.lat], +get(radiusInKm), options);
	let coordinates = geo.geometry.coordinates[0];

//   // if(!points) points = 64;
//   var coords = {
//     latitude: center.lat,
//     longitude: center.lng,
//   };

//   // clear ();

//   var km = get(radiusInKm) / 2;

//   var coordinates = [];
//   var distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
//   var distanceY = km / 110.574;

//   var theta, x, y;
//   for (var i = 0; i < points; i++) {
//     theta = i / points * (2 * Math.PI);
//     x = distanceX * Math.cos(theta);
//     y = distanceY * Math.sin(theta);
//     coordinates.push([coords.longitude + x, coords.latitude + y]);
//   }
//   coordinates.push(coordinates[0]);
  update(coordinates);
}

/// Fast Circle on-move Function
function circle_fast(clear = false, center = radius_center) {
	radius_center = center;
	let geo;
	if (center && !clear) {
		const options = {steps: 24, units: 'kilometers'};
		geo = circle([center.lng, center.lat], +get(radiusInKm), options);
//   return geo;
//   var geo = {
//     type: 'Feature',
//     geometry: {
//       type: 'Point',
//       coordinates: [center.lng, center.lat],
//     },
//   };
	} else {
		geo = {"type": "Polygon", "coordinates": []};
	}
	change_data('drawsrc', geo);
  return geo;
}

/// Scale Calulation Function.
// function circle_paint(clear = false) {
//   console.warn('-circle', clear);
//   if (mapobject) {
//     if (clear == true) {
//       return get(mapobject).setPaintProperty(
//         'circle_layer',
//         'circle-radius',
//         5
//       );
//     }

// 	const m2p = (meters, latitude, zoomLevel = 22) => {
// 		var earthCircumference = 40075017;
// 		var latitudeRadians = latitude * (Math.PI/180);
// 		var metersPerPixel = earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
// 		return meters / metersPerPixel;
// 	};
//     // const m2p = (meters, latitude) =>
//     //   (meters / 0.075) / Math.cos(latitude * Math.PI / 180);

//     get(mapobject).setPaintProperty('circle_layer', 'circle-radius', {
//       base: 2,
//       stops: [
//         [0, 0],
//         [22, m2p(+get(radiusInKm) * 1000, get(mapobject).getCenter().lat)],
//       ],
//     });
//   }
// }

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

export async function simplify_query(name = 'Area Name', options = {simplify_geo: false}) {
  /* A function using the bounding box to query the database and return the simplified polygons */

  const last = get(selected)[get(selected).length - 1];
  // get parent tile from drawing bounding box
  const bbox = [last.lng[0], last.lat[0], last.lng[1], last.lat[1]];

  const [x, y, z] = bboxToTile(bbox);
  console.warn('bbox', bbox, 'last', last, 'xyz', x, y, z);


  if (z === 28) return null;

  var tile = `${z}/${x}/${y}`;

  if (x < 7.) {
    alert(`Total area selected exceeds allowed limit (zoom level ${z}). Please click undo to continue. Parent Data Tile ${tile}`)
    return {
      error_title: 'Total area selected exceeds allowed limit. Please use the undo button to reduce area size.',
      error: `Parent Data Tile ${tile}`,
    }
  }

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
    padding: 20,
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

  let merge = makeBoundary({type: "FeatureCollection", features}, options.simplify_geo);

  merge.properties = { name, bbox, tile, oa, lsoa, msoa, oa_all: oalist, original: oalist.length };
  console.log('---merge---', merge);

  // 2732 character

  return merge;
}

export function geo_blob(q) {
  q.properties = {
    name: q.properties.name,
    bbox: q.properties.bbox,
    codes: q.properties.oa_all,
    codes_compressed: {oa: q.properties.oa, lsoa: q.properties.lsoa, msoa: q.properties.msoa}
  }
  return new Blob([JSON.stringify(q)], { type: "application/geo+json;charset=utf-8" });
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
