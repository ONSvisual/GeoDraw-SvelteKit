import {get} from 'svelte/store';
import {
  mapobject,
  radiusInKm,
  draw_type,
  selected,
  add_mode,
  draw_enabled,
  centroids,
} from '$lib/stores/mapstore';
import {boundaries} from '$lib/config/geography';
import {roundAll, extent} from './misc-utils';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
// import {bboxToTile} from '@mapbox/tilebelt';
import circle from '@turf/circle';
import turf_simplify from '@turf/simplify';
// import turf_bbox from '@turf/bbox';
// import turf_inpolygon from '@turf/boolean-point-in-polygon';
import {dissolve} from '$lib/util/mapshaper';
import bbox from '@turf/bbox';

const mzm = 10;
export var Draw;
export let coordinates = [];
// keep track of coordinates of centre of radius drawing tool
let radius_center = null;

////////////////////
///////////////////

function cursor () {
  // A function to change the df.loc({rows:df.$index.slice(0,4)})ap cursor
  const de = get (draw_enabled);
  const dt = get (draw_type);

  // if (de | dt === undefined ){document.querySelector('#mapcontainer div canvas').style.cursor = 'no-drop';}
  let canvas = document.querySelector ('#mapcontainer div canvas');
  if (canvas) {  
    switch (dt) {
      case 'select':
        canvas.style.cursor = 'auto';
        break;
      case 'polygon':
        canvas.style.cursor = 'crosshair';
        break;
      case 'radius':
        canvas.style.cursor = 'crosshair';
        break;
      default:
        canvas.style.cursor = 'grab';
    }
  }
}

export async function init_draw () {
  get (mapobject).addSource ('drawsrc', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      },
    },
  });

  get (mapobject).addLayer ({
    id: 'draw_layer',
    type: 'fill',
    source: 'drawsrc',
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.1,
    },
  });

  get (mapobject).addLayer ({
    id: 'draw_outline',
    type: 'line',
    source: 'drawsrc',
    layout: {'line-cap': 'round', 'line-join': 'round'},
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  });

  Draw = new MapboxDraw ({
    draw: ['draw_polygon'],
    displayControlsDefault: false,
    controls: {
      polygon: false,
      trash: false,
    },
    userProperties: true,
  });

  get (mapobject).addControl (Draw, 'top-right');
  get (mapobject).on ('draw.selectionchange', drawPoly);
  Draw.deleteAll ();
  async function drawPoly (e) {
    var data = Draw.getAll ();
    var geo = await data.features[0];
    update (geo);
    clearpoly ();
  }
  get (mapobject).on ('zoomend', function () {
    const de = get (mapobject).getZoom () < mzm;
    draw_enabled.set (de);
    // cursor()
  });

  get (mapobject).doubleClickZoom.enable ();
  // on move events
  get (mapobject).on ('mousemove', 'bounds', function move (e) {
    // console.log (e.lngLat, get (draw_type));

    if (get (draw_type) == 'radius') circle_fast (false, e.lngLat);
  });

  // clear coordinates each time we change
  draw_type.subscribe (dt => {
    coordinates = [];
    add_mode.set (true);
    circle_fast ((clear = get (draw_type) != 'radius'));
    Draw.deleteAll ();
    cursor ();
    if (dt === 'polygon') {
      Draw.changeMode ('draw_polygon', {});
    }
  });

  // set default
  radius_center = null;
  circle_fast ((clear = true));
  draw_type.set ('move');

  // update circle tool each radius change
  radiusInKm.subscribe (() => circle_fast ());

  function boundclick (e) {
    switch (get (draw_type)) {
      case 'radius':
        draw_radius (e.lngLat);
        break;
      case 'select':
        draw_point (e);
        break;
    }
  }

  get (mapobject).on ('click', 'bounds', boundclick); //mouse
  get (mapobject).on ('touchstart', 'bounds', boundclick); //touch
}

export function simplify_geo (geometry, max_length = 3000) {
  // Simplifies a geojson geometry
  let simple;
  let length = max_length;
  let precision = 5;

  while (length >= max_length && precision >= 2) {
    simple = turf_simplify (geometry, {
      highQuality: true,
      tolerance: Math.pow (10, -precision),
    });
    simple.coordinates = roundAll (simple.coordinates, Math.ceil (precision));
    length = JSON.stringify (simple).length;
    precision -= 0.5;
  }
  // console.debug (
  //   'simplified polygon',
  //   `string length: ${length}, precision: ${precision}`
  // );
  return simple;
}

function makeBoundary (geojson, simplify = false) {
  let dissolved = dissolve (geojson);

  let simple;
  if (simplify) {
    simple = simplify_geo (dissolved.geometry);
  } else {
    simple = dissolved.geometry;
    simple.coordinates = roundAll (simple.coordinates, 6);
  }

  return {type: 'Feature', geometry: simple};
}

function clear () {
  coordinates = [];
  change_data ('drawsrc', {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
  });
}

export function clearpoly () {
  // clear()
  Draw.deleteAll ();
  Draw.changeMode ('draw_polygon', {});
}

export function change_data (layer, data) {
  get (mapobject).getSource (layer).setData (data);
}

////////////////////
// Matching Utilities
////////////////////

export async function update (geo) {
  // update all polygon like draw items
  document.querySelector ('#mapcontainer div canvas').style.cursor = 'wait';

  const features = await get (centroids).contains (geo);

  var current = get (selected);
  var last = current[current.length - 1];
  // console.debug ('update,last', last, current);

  if (get (add_mode)) {
    current.push ({
      oa: new Set ([...last.oa, ...features.oa]),
    });
  } else {
    current.push ({
      oa: new Set ([...last.oa].filter (x => !features.oa.has (x))),
    });
  }

  updatelocal (current);
  cursor ();
}

function draw_point (e) {
  // update using select tool
  let feature = e.features[0];
  if (feature) {
    let code = feature.properties[boundaries.id_key];
    let current = get (selected);
    let oas = current[current.length - 1].oa;
    if (oas.has (code)) {
      oas = new Set (Array.from (oas).filter (oa => oa !== code));
    } else {
      oas = new Set ([...Array.from (oas), code]);
    }
    current.push ({oa: oas});
    updatelocal (current);
  }
}

function updatelocal (current) {
  // limit our undo list to 20
  if (current.length >= 20) current = current.slice (current.length - 20, current.length);

  selected.set (current);
  var items = current[current.length - 1];
  // we cannot stringify sets!
  items = JSON.stringify (
    items,
    (_key, value) => (value instanceof Set ? [...value] : value)
  );
  localStorage.setItem ('draw_data', items);
}

////////////////////
// Circle Tools
////////////////////

function draw_radius (center, points = 24) {
  const options = {steps: points, units: 'kilometers'};
  let geo = circle ([center.lng, center.lat], +get (radiusInKm), options);

  update (geo);
}

/// Fast Circle on-move Function
function circle_fast (clear = false, center = radius_center) {
  let geo;
  if (center && !clear) {
    const options = {steps: 24, units: 'kilometers'};
    geo = circle ([center.lng, center.lat], +get (radiusInKm), options);
  } else {
    geo = {type: 'Polygon', coordinates: []};
  }
  change_data ('drawsrc', geo);
  return geo;
}

////////////////////
// Query
////////////////////

export function geo_blob (q) {
  let geojson = q.geojson;
  geojson.properties = {
    name: q.properties.name,
    bbox: bbox (geojson),
    codes: q.properties.oa_all,
    codes_compressed: q.properties.compressed,
  };
  return new Blob ([JSON.stringify (geojson)], {
    type: 'application/json',
  });
}
