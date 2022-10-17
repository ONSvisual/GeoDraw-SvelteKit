<script>
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';
  import tooltip from '$lib/ui/tooltip';
  import Select, {getPlace} from '$lib/ui/Select.svelte';
  import Slider from '$lib/ui/Slider.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import {download, clip} from '$lib/util/functions.js';
  import {get} from 'svelte/store';
  import AreaMap from './AreaMap.svelte';
  import '$lib/draw/css/mapbox-gl.css';
  import {onMount, onDestroy} from 'svelte';

  let speak = false;
  import {
    mapsource,
    maplayer,
    mapfunctions,
    mapobject,
    draw_type,
    add_mode,
    radiusInKm,
    selected,
    server,
    centroids,
    minzoom,
    maxzoom,
  } from './mapstore.js';

  import {geo_blob, update, simplify_geo} from './drawing_utils.js';
  // import bbox from '@turf/bbox';

  import {GetCentroids} from './centroid_utils.js';

  const modelist = [
    {key: 'move', label: 'Pan and zoom'},
    {key: 'select', label: 'Click to select'},
    {key: 'polygon', label: 'Draw a polygon'},
    {key: 'radius', label: 'Draw a radius'},
  ];

  let advanced = false;
  $: modes = advanced? modelist:modelist.slice(0,2)

  let state = {
    mode: 'move',
    radius: 5,
    select: 'add',
    name: 'Area Name',
    showSave: false,
    topics: [],
    topicsExpand: false,
    topicsFilter: '',
  };
  const zoomstop = 8
  let zoom; // prop bound to map zoom level
  let uploader; // DOM element for geojson file upload


  $: showTray = ['polygon', 'radius'].includes(state.mode);

  function setDrawData() {
    let items = $selected[$selected.length - 1];
    items = JSON.stringify(items, (_key, value) =>
      value instanceof Set ? [...value] : value
    );
    localStorage.setItem('draw_data', items);
  }

  let newselect;

  async function init() {
    // calculate the centroids and simplifications.
    centroids.set(await GetCentroids({year: 21, dfd: dfd}));
    console.log('cent', $centroids);

    /* Initialisation function: This loads the map, any locally stored drawing and initialises the drawing tools */
    // console.clear();

    // map setup and vars
    $mapsource = {
      area: {
        type: 'vector',
        maxzoom: maxzoom,
        minzoom: minzoom,
        tiles: [`${server}/{z}/{x}/{y}.pbf`],
      },
    };

    $maplayer = [
      {
        id: 'bounds',
        source: 'area',
        'source-layer': 'oa',
        // tileSize: 256,
        type: 'fill',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 1,
          'fill-outline-color': 'steelblue',
        },
      },
    ];

    /// Read out area names

    if ('SpeechSynthesisUtterance' in window) {
      var msg = new SpeechSynthesisUtterance();
      console.debug('speech tools enabled');
    }

    $mapfunctions = [
      {
        event: 'contextmenu',
        layer: 'bounds',
        callback: (e) => {
          if (speak) {
            console.log(e.features[0].properties);
            var props = e.features[0].properties;
            msg.text = props.name;
            if (!window.speechSynthesis.speaking) {
              window.speechSynthesis.speak(msg);
            }
          }
        },
      },
    ];
    /// end read out areas

    async function recolour() {
      const items = $selected[$selected.length - 1];
      // if (!items.oa.size) return;
      console.debug('---recolour', items);
      $mapobject.setPaintProperty('bounds', 'fill-color', [
        'match',
        ['get', 'areacd'],
        ['literal', ...items.oa],
        'rgba(32, 96, 149, 0.4)',
        'transparent',
      ]);
    }

    $mapobject.on('load', async () => {
      selected.subscribe(recolour);

      newselect = function () {
        localStorage.clear();
        selected.set([{oa: new Set(), parents: []}]);
        console.log(get(selected));
      };

      let hash = window.location.hash;
      if (hash.length == 10) {
        let oa = [hash.slice(1)];
        newselect();

        if (+(await get(centroids).indf(oa)) > -1) {
          bbox = get(centroids).bounds(oa);

          $selected = [
            $selected,
            {
              oa: new Set(oa),
              parents: get(centroids).parent(oa),
            },
          ];

          $mapobject.fitBounds(bbox, {padding: 20});
          state.name = oa;
          setDrawData();
        }
        history.replaceState(null, null, ' ');
      }
      if (localStorage.getItem('draw_data') || false) {
        var q;
        q = await JSON.parse(localStorage.getItem('draw_data'));
        if (!q.oa.length) {
          newselect();
          return 0;
        }

        console.debug('q', q);
        var bbox = get(centroids).bounds([...q.oa]);
        console.error(167, bbox, q);

        $mapobject.fitBounds(bbox, {
          padding: 20,
          linear: true,
        });

        q.oa = new Set(q.oa);
        selected.set([q]);

      }

      // Keep track of map zoom level
      zoom = $mapobject.getZoom();
      $mapobject.on('moveend', () => (zoom = $mapobject.getZoom()));
    });

  } //endinit

  function load_geo() {
    let file = uploader.files[0] ? uploader.files[0] : null;

    if (file) {
      selected.set([{oa: new Set(), lat: [], lng: [], parents: []}]);

      const reader = new FileReader();

      reader.onload = (e) => {
        // Read + simplify the boundary
        let b = JSON.parse(e.target.result);

        if (b.type == 'FeatureCollection') {
          b = b.features[0];
        } else if (b.type == 'Geometry') {
          b = {type: 'Feature', geometry: b};
        }

        if (b.properties && b.properties.codes) {
          console.log('reading uploaded codes');
          let bb = b.properties.bbox
            ? b.properties.bbox
            : $centroids.getbbox(boundary);
          let oa = new Set(b.properties.codes);
          $selected = [
            $selected,
            {
              oa: oa,
              parents: get(centroids).parent(oa),
            },
          ];
          $mapobject.fitBounds(bb, {padding: 20});
        } else if (b.geometry) {
          console.log('reading uploaded geometry');
          if (JSON.stringify(b.geometry).length > 10000)
            b.geometry = simplify_geo(b.geometry, 10000);
          let bb = bbox(b);
          let center = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
          $mapobject.flyTo({center, zoom: 9});
          $mapobject.once('idle', () => {
            update(b.geometry);
            $mapobject.fitBounds(bb, {padding: 20});
          });
        } else {
          b = null;
          alert('Invalid geography file. Must be geojson format.');
        }

        if (b) {
          let props = b.properties;
          state.name =
            props && props.areanm
              ? props.areanm
              : props && props.name
              ? props.name
              : 'Area Name';
          setDrawData();
        }
      };
      reader.readAsText(file);
    }
  }

  onMount(() => {
    init();
    console.log(window.location.hash);
  });
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/flatbush"></script>
</svelte:head>

<nav>
  <div class="nav-left" style="z-index:99;">
    {#each modes as mode}
      <label
        id={'init_' + mode.key}
        class:active={state.mode == mode.key}
        class:disabled={zoom < zoomstop}
        title={mode.label}
        on:click={function () {
          $draw_type = mode.key == 'move' ? null : mode.key;
        }}
        use:tooltip
      >
        <input
          type="radio"
          bind:group={state.mode}
          name="mode"
          value={mode.key}
          disabled={zoom < zoomstop}
        />
        <Icon type={mode.key} />
      </label>
    {/each}
  </div>
  
 
  <div class="nav-right"> 
    
    {#if advanced}

    <button
      title={state.showSave ? 'Close save options' : 'Save selected area'}
      use:tooltip
      on:click={() => (state.showSave = !state.showSave)}
      class:active={state.showSave}
      disabled={!$selected[$selected.length - 1].oa.size > 0}
    >
      <Icon
        type={state.showSave ? 'add' : 'download'}
        rotation={state.showSave ? 45 : 0}
      />
    </button>

    <button
      title="Undo last action"
      use:tooltip

      disabled={$selected.length < 2}
      on:click={() => {
        $selected = $selected.slice(0, -1);
        setDrawData();
      }}
    >

    
      <Icon type="undo" />
    </button>

    {:else}
    <button
      class="text secondary"
      style:opacity=0.8
      on:click={()=>{advanced=true}}
    > Further Tools
    </button>
    {/if}


    <button
      class="alert"
      title="Clear all areas"
      use:tooltip
      on:click={() => {
        newselect();
        state.name = 'Area Name';
      }}
    >
      <Icon type="clear" />
    </button>
  





    <button
      class="text confirm"
      disabled={!$selected[$selected.length - 1].oa.size > 0}
      on:click={() => {
        document.querySelector('#mapcontainer div canvas').style.cursor =
          'wait';
        $centroids
          .simplify(state.name, $selected[$selected.length - 1])

          .then((q) => {
            if (q) {
              console.debug('---req  ', q);

              const items = $selected[$selected.length - 1];

              if (items.oa.size > 0) {
                if (q.error) return false;

                console.log('buildpage', q);
                localStorage.setItem('onsbuild', JSON.stringify(q));

                return true;
              }
            } else {
              alert('No features selected.');
              document.querySelector('#mapcontainer div canvas').style.cursor =
                'auto';
              return false;
            }
          })
          .then((rdir) => {
            if (rdir) {
              goto(`${base}/build/`);
            }
          });
      }}
    >
      <span>Build profile</span><Icon type="chevron" />
    </button>
  </div>
</nav>
{#if state.showSave}
  <nav class="tray">
    <div />
    <div class="save-buttons">
      <input type="text" bind:value={state.name} placeholder="Type a name" />
      <button
        class="text"
        on:click={async () => {
          let geo = $centroids.simplify(
            state.name,
            $selected[$selected.length - 1]
          );
          alert('check here');
          let blob = geo_blob(geo);
          download(blob, `${state.name}.json`);
        }}
      >
        <Icon type="download" /><span>Save geography</span>
      </button>
      <button
        class="text"
        on:click={() =>
          clip(
            Array.from($selected[$selected.length - 1].oa).join(','),
            'Copied output area codes to clipboard'
          )}
      >
        <Icon type="copy" /><span>Copy area codes</span>
      </button>
    </div>
  </nav>
{:else if showTray}
  <nav class="tray">
    {#if state.mode == 'radius'}
      <div class="slider">
        <span>Radius</span>
        <Slider bind:value={$radiusInKm} />
        <input type="text" bind:value={$radiusInKm} />km
      </div>
    {/if}
    <div class="select-mode">
      <span>Selection mode</span>
      <label
        class:active={state.select == 'add'}
        title="Add to selection"
        use:tooltip
      >
        <input
          type="radio"
          on:click={() => ($add_mode = true)}
          bind:group={state.select}
          name="select"
          value="add"
        />
        <Icon type="select_add" />
      </label>
      <label
        class:active={state.select == 'subtract'}
        title="Subtract from selection"
        use:tooltip
      >
        <input
          type="radio"
          bind:group={state.select}
          on:click={() => ($add_mode = false)}
          name="select"
          value="subtract"
        />
        <Icon type="select_subtract" />
      </label>

      <!-- save -->
      <!-- 
    {#if state.mode == 'polygon'}
	<div style = 'float:left;filter:invert(1);opacity:0.7'>
      <span>  </span>
      <label title="Clear (selection only)" use:tooltip on:click={()=>clearpoly()}>
        <input
          type="button"
          name="clear_coordinates"
          value="clear_coordinates"
          
        />
        <Icon type="clear" />
      </label> -->
      <!-- <label title="Save (selection only)" use:tooltip on:click={()=>savepoly()}>
        <input
          type="button"
          name="save_coordinates"
          value="save_coordinates"
        />
        <Icon type="download" />
      </label> -->
      <!-- </div>
    {/if} -->
    </div>
  </nav>
{/if}
<div id="map">
  <AreaMap drawing_tools={true} />
</div>
<aside class="info-box" style:top="{showTray || state.showSave ? 200 : 158}px">
  <div class="search">
    <Select
      on:select={(e) => {
        newselect();

        if (e.detail.type == 'place') {
          let bbox = e.detail.bbox;
          let oa = new Set(e.detail.codes);
          $selected = [
            $selected,
            {
              oa: oa,
              parents: $centroids.parent([...oa]),
            },
          ];
          $mapobject.fitBounds(bbox, {padding: 20});
          state.name = e.detail.areanm;
        } else if (e.detail.type == 'postcode') {
          let center = e.detail.center;
          $mapobject.flyTo({center: center, zoom: 14});
          $mapobject.once('idle', () => {
            let coords = $mapobject.project(center);
            let features = $mapobject.queryRenderedFeatures(
              [coords.x, coords.y],
              {layers: ['bounds']}
            );

            var oa = new Set(features.map((f) => f.properties.oa));
            $selected = [
              $selected,
              {
                oa: oa,
                parents: $centroids.parent([...oa]),
              },
            ];
          });
        }
        setDrawData();
      }}
    />
    <button
      title="Upload a saved area"
      use:tooltip
      on:click={() => uploader.click()}
    >
      <Icon type="upload" />
    </button>
    <input
      type="file"
      accept=".geojson,.json"
      style="display:none"
      bind:this={uploader}
      on:change={load_geo}
    />
  </div>
  <div class="message">
    {#if (!zoom || zoom < zoomstop) && $selected[$selected.length - 1].oa.size > 0}
      <strong>Zoom in to continue</strong><br />
      You can
      <button
        class="btn-link"
        on:click={() => {
          let q = $selected[$selected.length - 1];
          let bbox = [q.lng[0], q.lat[0], q.lng[1], q.lat[1]];
          $mapobject.fitBounds(bbox, {padding: 20});
        }}>click here</button
      > to return to the area you have drawn.
    {:else if !zoom || zoom < 9}
      <strong>How to get started</strong><br />
      Zoom in to an area on the map to start drawing, or use the search box above
      to find a ready-made area.
    {:else if state.mode == 'polygon'}
      <strong>Draw a polygon mode</strong><br />
      Click on the map to draw a polygon. Click again on the first or last point
      to close the polygon.
    {:else if state.mode == 'radius'}
      <strong>Draw a radius mode</strong><br />
      Select a radius in kilometres from the menu, then click on the map to draw
      a circle.
    {:else if state.mode == 'select'}
      <strong>Click and select mode</strong><br />
      Click an individual area to add or remove it from your selection.
    {:else}
      <strong>Pan and zoom mode</strong><br />
      Explore the map to find a location of interest, then select a drawing tool
      from the menu.
    {/if}
  </div>
</aside>

<style>
  div.maplibregl-control-container {
    position: absolute;
    z-index: 999999;
    bottom: 0;
  }
</style>
