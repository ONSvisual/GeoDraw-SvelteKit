import {get} from 'svelte/store';
import {
  mapobject,
  radiusInKm,
  draw_type,
  selected,
  add_mode,
  draw_enabled,
  centroids
} from './mapstore.js';
import {roundAll,extent} from './misc_utils.js'
import MapboxDraw from '@mapbox/mapbox-gl-draw';
// import {bboxToTile} from '@mapbox/tilebelt';
import circle from '@turf/circle';
import turf_simplify from '@turf/simplify';
// import turf_bbox from '@turf/bbox';
// import turf_inpolygon from '@turf/boolean-point-in-polygon';
import {dissolve} from '$lib/mapshaper';



const mzm = 10
export var Draw;
export let coordinates = [];
// keep track of coordinates of centre of radius drawing tool
let radius_center = null;





////////////////////
///////////////////

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
    var coords = await data.features[0].geometry.coordinates[0];
    update (coords);
    clearpoly ();
  }
  get (mapobject).on ('zoomend', function () {
    const de = get (mapobject).getZoom () < mzm
    draw_enabled.set(de);
    cursor()
  });

  get(mapobject).doubleClickZoom.enable ()
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
    cursor() 
    if (dt === 'polygon') {Draw.changeMode ('draw_polygon', {})}
  
  });

  // set default
  radius_center = null;
  circle_fast ((clear = true));
  draw_type.set ('move');
  

  // update circle tool each radius change
  radiusInKm.subscribe (() => circle_fast ());

  get (mapobject).on ('click', 'bounds', function boundclick (e) {
    switch (get (draw_type)) {
      case 'radius':
        draw_radius (e.lngLat);
        break;
      case 'select':
        draw_point (e);
        break;
    }
  });


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
  console.debug (
    'simplified polygon',
    `string length: ${length}, precision: ${precision}`
  );
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

export function clearpoly () {// clear()
  Draw.deleteAll ();
  Draw.changeMode ('draw_polygon', {});
}

export function change_data (layer, data) {
  get (mapobject).getSource (layer).setData (data);
}


////////////////////
// Matching Utilities
////////////////////

export async function update (coordinates) {
  // update all polygon like draw items
  document.querySelector('#mapcontainer div canvas').style.cursor='wait'

  const features = await get(centroids).contains(coordinates)

 console.debug('update centroids',features)


  var current = get (selected);
  var last = current[current.length - 1];

  // features.bbox.map (d => {
  //   last.lat.push (d[1]);
  //   last.lng.push (d[0]);
  // });

  if (get (add_mode)) {
    current.push ({
      oa: new Set ([...last.oa, ...features.oa]),
      parents: [...last.parents, ...features.parents],
    });
  } else {

    // drop matches individually
    features.parents.forEach(d=>{
      var id = last.parents.indexOf(d)
      if (id >= 0) last.parents.splice(id,1)
    })
    current.push ({
      oa: new Set ([...last.oa].filter (x => !features.oa.has (x))),
      parents: last.parents,
    });
  }

updatelocal(current)
  cursor()
}

function draw_point (e) {
// update using select tool 

console.debug(e.features.map (d => d.properties.areacd))
  const oalist = new Set (e.features.map (d => d.properties.areacd));
  const current = get (selected);
  var last = Object.assign ({}, current[current.length - 1]);



  last = {
    oa: new Set (last.oa),
    parents: [...last.parents],
  };

  [...oalist].forEach (
    oa => {

      const parent = get(centroids).parent(oa)

      if (last.oa.has (oa)){
         last.oa.delete (oa)
         var id = last.parents.indexOf(parent)
         if (id>-1) last.parents.splice(id,1)
      }else{
        last.oa.add (oa)
        last.parents.push(parent)
      }
      })

  current.push (last);
  updatelocal(current)
  
}


function updatelocal(current){
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
  let coordinates = geo.geometry.coordinates[0];

  update (coordinates);
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
  q.properties = {
    name: q.properties.name,
    bbox: q.properties.bbox,
    codes: q.properties.oa_all,
    codes_compressed: {
      oa: q.properties.oa,
      lsoa: q.properties.lsoa,
      msoa: q.properties.msoa,
    },
  };
  return new Blob ([JSON.stringify (q)], {
    type: 'application/geo+json;charset=utf-8',
  });
}


function cursor(){
  // A function to change the df.loc({rows:df.$index.slice(0,4)})ap cursor
  const de = get(draw_enabled)
  const dt = get(draw_type);

  if (de | dt===undefined ){document.querySelector('#mapcontainer div canvas').style.cursor = 'no-drop';}
  else if (dt === 'move') {document.querySelector('#mapcontainer div canvas').style.cursor='move'}
  else if (dt === 'select'){
    document.querySelector('#mapcontainer div canvas').style.cursor='auto'
  } 
  else{
    document.querySelector('#mapcontainer div canvas').style.cursor='url("/cursor/Working.ani"),crosshair'
  }
}
