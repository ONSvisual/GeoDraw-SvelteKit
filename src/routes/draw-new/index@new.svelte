<script>
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';
  import tooltip from '$lib/ui/tooltip';
  import Select from '$lib/ui/Select.svelte';
  import Slider from '$lib/ui/Slider.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import {get} from 'svelte/store';
  import {default as AreaMap} from '$lib/draw/AreaMap.svelte';
  
  import '$lib/draw/css/mapbox-gl.css';
  import {onMount} from 'svelte';
  let webgl_canvas;
  let width = '100%';
  let height = '100%';
  //   let pending = new Set([]);
  let error = false;
  let speak = false;
  import {
    // select,
    mapsource,
    maplayer,
    mapfunctions,
    mapobject,
    mapstyle,
    minzoom,
    maxzoom,
    location,
    maxbounds,
    draw_type,
    draw_enabled,
    add_mode,
    radiusInKm,
    selected,
    query,
    server,
  } from '$lib/draw/mapstore.js';

  import {simplify_query, clearpoly} from '$lib/draw/MapDraw.js';
  import {mode} from 'd3';

  const modes = [
    {key: 'move', label: 'Pan and zoom'},
    {key: 'polygon', label: 'Draw a polygon'},
    {key: 'radius', label: 'Draw a radius'},
    {key: 'select', label: 'Click to select'},
  ];

  let state = {
    mode: 'move',
    radius: 5,
    select: 'add',
    name: '',
    showSave: false,
    topics: [],
    topicsExpand: false,
    topicsFilter: '',
  };

  $: showTray = ['polygon', 'radius'].includes(state.mode);

  async function init() {
    /* Initialisation function: This loads the map, any locally stored drawing and initialises the drawing tools */
    console.clear();

    // map setup and vars
    $mapsource = {
      area: {
        type: 'vector',
        tiles: [`${server}/{z}/{x}/{y}.pbf`],
      },
    };

    $maplayer = [
      {
        id: 'bounds',
        source: 'area',
        'source-layer': 'geodraw',
        // tileSize: 256,
        type: 'fill',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0.7,
          'fill-outline-color': 'steelblue',
        },
      },
      {
        id: 'centroids',
        source: 'area',
        'source-layer': 'centroids',
        type: 'circle', //background?/
        paint: {
          'circle-radius': 0.6,
          'circle-color': 'red',
          'circle-opacity': 0.2,
        },
      },
    ];

    /// Read out area names

    if ('SpeechSynthesisUtterance' in window) {
      var msg = new SpeechSynthesisUtterance();
      console.error('speech tools enabled');
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

      console.warn('---recolour', items.oa);
      $mapobject.setPaintProperty('bounds', 'fill-color', [
        'match',
        ['get', 'oa'],
        ['literal', ...items.oa],
        'orange',
        'transparent',
      ]);
    }

    $mapobject.on('load', async () => {
      selected.subscribe(recolour);

      if (localStorage.getItem('draw_data') || false) {
        var q;
        q = await JSON.parse(localStorage.getItem('draw_data'));

        console.error('q', q);

        $mapobject.fitBounds([q.lng[0], q.lat[0], q.lng[1], q.lat[1]], {
          padding: 20,
          linear: true,
        });

        // alert (2)

        q.oa = new Set(q.oa);
        selected.set([q]);
      } else {
        // move mapobject to location
        $mapobject.fitBounds(location.bounds, {
          padding: 20,
          linear: true,
        });
      }



  })

// lets start with a polygon tool 

return Promise.resolve().finally(()=>{document.getElementById('init_polygon').click()
$draw_type='polygon'});


}  //endinit

  onMount(init)
</script>

<nav>
  <div class="nav-left" style="z-index:99;">
    {#each modes as mode}
      <label
      id={'init_'+mode.key}
        class:active={state.mode == mode.key}
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
          
        />

        <Icon type={mode.key} />
      </label>
    {/each}
  </div>
  <div class="nav-right">
    <button title="Undo last action" disabled use:tooltip>
      <Icon type="undo" />
    </button>
    <button
      class="alert"
      title="Clear all areas"
      use:tooltip
      on:click={function clear_selection() {
        selected.set([{oa: new Set(), lat: [], lng: []}]);
        query.set({error: false});
        localStorage.clear();
      }}
    >
      <Icon type="clear" />
    </button>
    <button
      title={state.showSave ? 'Close save options' : 'Save selected area'}
      use:tooltip
      on:click={() => (state.showSave = !state.showSave)}
      class:active={state.showSave}
    >
      <Icon
        type={state.showSave ? 'add' : 'download'}
        rotation={state.showSave ? 45 : 0}
      />
    </button>
    <button
      class="text confirm"
      on:click={() => {
        simplify_query()
          .then((q) => {
            if (q) {
              console.warn('---req  ', q);
              query.set(q);
              const items = $selected[$selected.length - 1];

              if (items.oa.size > 0) {
                //   items.oa = [...items.oa]; // we can't encode sets
                // //   localStorage.setItem('draw_data', JSON.stringify(items));

                console.log('buildpage', q);

                return true;
              }
            } else {
              alert('No features selected.');
              return false;
            }
          })
          .then((rdir) => {
            if (rdir) goto(`${base}/build-new`);
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
      <button class="text">
        <Icon type="download" /><span>Save area codes</span>
      </button>
      <button class="text">
        <Icon type="download" /><span>Save boundary</span>
      </button>
    </div>
  </nav>
{:else if showTray}
  <nav class="tray" style="z-index:9;">
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
        <Icon type="add" />
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
        <Icon type="subtract" />
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
<aside class="info-box" style:top="{showTray || state.showSave ? 146 : 104}px">
  <div class="search">
    <Select mode="search" placeholder="Change area or postcode" />
    <button title="Upload a saved area" use:tooltip>
      <Icon type="upload" />
    </button>
  </div>
  <div class="message">Zoom in to start drawing a custom area.</div>
</aside>

<style>
	nav input{
		width:0;
	}

  div.maplibregl-control-container{
    position:absolute;
    z-index: 999999;
    bottom:0;
  }

  #map{
    height:90vh!important;
  top:0}
</style>
