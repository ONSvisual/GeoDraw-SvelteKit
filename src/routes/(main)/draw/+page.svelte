<script>
  import ONSloader from '$lib/ui/ONSloader.svelte';
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';
  import tooltip from '$lib/ui/tooltip';
  import Select, {getPlace} from '$lib/ui/Select.svelte';
  import Slider from '$lib/ui/Slider.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import {download, clip} from '$lib/util/functions';
  import bbox from '@turf/bbox';
  import Map from '$lib/charts/Map.svelte';
  import '$lib/css/maplibre-gl.css';
  import {onMount} from 'svelte';
  import {update, simplify_geo, geo_blob} from '$lib/util/drawing-utils';
  import {roundCount} from '$lib/util/functions';
  import {
    mapsource,
    maplayer,
    mapfunctions,
    mapobject,
    draw_type,
    add_mode,
    radiusInKm,
    selected,
    centroids
  } from '$lib/stores/mapstore';
  import {boundaries, cdnbase} from '$lib/config/geography';
  import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';


  const modelist = [
    {key: 'move', label: 'Pan and zoom'},
    {key: 'select', label: 'Click to select'},
    {key: 'polygon', label: 'Draw a polygon'},
    {key: 'radius', label: 'Draw a radius'},
  ];

  // variable custom testing
  let isLoading = false;
  let advanced = true; //new Date()%2;
  $: modes = advanced ? modelist : modelist.slice(0, 2);
  let state = {
    mode: 'move',
    radius: 5,
    select: 'add',
    name: '',
    showSave: false,
    topics: [],
    topicsExpand: false,
    topicsFilter: '',
    infoExpand: true,
  };
  const zoomstop = 6;
  let zoom; // prop bound to map zoom level
  let uploader; // DOM element for geojson file upload
  let pselect = '0';

  $: showTray = ['polygon', 'radius'].includes(state.mode);

  function setDrawData() {
    let items = $selected[$selected.length - 1];
    items = JSON.stringify(items, (_key, value) =>
      value instanceof Set ? [...value] : value
    );
    localStorage.setItem('draw_data', items);
  }

  let newselect;
  
  function init() {
    isLoading = true;
      /* 
    A section to clear the local storage if past the last update date
    */
    if (new Date(localStorage.getItem('lastdate')) < new Date('2022-18-18')) {
      localStorage.clear();
    }
    localStorage.setItem('lastdate', +new Date());

    /* Initialisation function: This loads the map, any locally stored drawing and initialises the drawing tools */
    // console.clear();

    // map setup and vars
    const promoteId = {};
    promoteId[boundaries.layer] = boundaries.id_key;

    $mapsource = {
      area: {
        type: 'vector',
        maxzoom: 12, // IMPORTANT: This is the maximum zoom the tiles are available for, so they can over-zoom
        minzoom: 6, // IMPORTANT: This is the minimum zoom available
        tiles: [boundaries.url],
        promoteId
      },

      points: {
        type: 'geojson',
        data: $centroids.geojson
      },
    };

    $maplayer = [
      {
        id: 'bounds',
        source: 'area',
        'source-layer': boundaries.layer,
        type: 'fill',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 1
        },
      },
      {
        id: 'bounds-line',
        source: 'area',
        'source-layer': boundaries.layer,
        type: 'line',
        paint: {
          'line-color': 'steelblue',
          'line-width': ['case', ['==', ['feature-state', 'hovered'], true], 2, 0.3]
        },
      },
      {
        id: 'cpt',
        source: 'points',
        type: 'circle',
        minzoom: 10,
        paint: {
          'circle-radius': 1,
          'circle-color': 'coral'
      }}
    ];

    $mapfunctions = [
    ];
    /// end read out areas

    function recolour(selected) {
      const items = selected[selected.length - 1];

      pselect = items.oa.size
        ? [...items.oa]
            .map((d) => $centroids.population(d) || 0)
            .reduce((a, b) => a + b)
        : 0;

      // if (!items.oa.size) return;
      // console.debug('---recolour', items);
      if ($mapobject.getLayer('bounds'))
        $mapobject.setPaintProperty('bounds', 'fill-color', [
          'match',
          ['get', 'areacd'],
          ['literal', ...items.oa],
          'rgba(32, 96, 149, 0.4)',
          'transparent',
        ]);
      if (selected.length > 1 && state.name) state.name = "";
    }

    $mapobject.on('load', async () => {
      newselect = function () {
        localStorage.clear();
        selected.set([{oa: new Set()}]);
      };

      let hash = window.location.hash;
      if (hash === '#undefined') {
        hash = window.location.hash = '';
      } else if (hash.length == 10) {
        let code = hash.slice(1);
        try {
          const res = await fetch(`${cdnbase}/${code.slice(0, 3)}/${code}.json`);
          const data = await res.json();
          newselect();
          selected.set([{oa: new Set()}]);
          localStorage.clear();
          
          $selected = [
            ...$selected,
            {
              oa: new Set($centroids.expand(data.properties.c21cds))
            },
          ];

          $mapobject.fitBounds(data.properties.bounds, {padding: 40});

          state.name = data.properties.hclnm ? data.properties.hclnm :
            data.properties.areanm ? data.properties.areanm :
            data.properties.areacd;
          setDrawData();

          analyticsEvent({
            event: "hashSelect",
            areaCode: data.properties.areacd,
            areaName: state.name
          });
        }
        catch {
          alert(`Requested GSS code ${code} is unavailable or invalid.`);
        }

        history.replaceState(null, null, ' ');
      } else if (localStorage.getItem('onsbuild')) {
        var q = JSON.parse(localStorage.getItem('onsbuild')).properties;
        state.name = q.name;

        if (!q.oa_all.length) {
          newselect();
          return 0;
        }

        var bbox = $centroids.bounds([...q.oa_all]);

        $mapobject.fitBounds(bbox, {
          padding: 40,
          linear: true,
        });

        $selected = [
          {
            oa: new Set(q.oa_all)
          },
        ];
      } else if (localStorage.getItem('draw_data') || false) {
        var q = JSON.parse(localStorage.getItem('draw_data'));

        if (!q.oa.length) {
          newselect();
          return 0;
        }

        var bbox = $centroids.bounds([...q.oa]);

        $mapobject.fitBounds(bbox, {
          padding: 40,
          linear: true,
        });

        q.oa = new Set(q.oa);
        selected.set([q]);
      }

      // Keep track of map zoom level
      zoom = $mapobject.getZoom();
      $mapobject.on('moveend', () => (zoom = $mapobject.getZoom()));
      isLoading = false;
    });

    selected.subscribe(recolour);
    recolour($selected);
  } //endinit

  function load_geo() {
    let file = uploader.files[0] ? uploader.files[0] : null;

    if (file) {
      selected.set([{oa: new Set()}]);

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
          let bb = b.properties.bbox
            ? b.properties.bbox
            : bbox(b);
          let oa = b.properties.codes;
          $selected = [
            $selected,
            {
              oa: new Set(oa)
            },
          ];
          $mapobject.fitBounds(bb, {padding: 40});
        } else if (b.geometry) {
          if (JSON.stringify(b.geometry).length > 10000) b.geometry = simplify_geo(b.geometry, 10000);
          let bb = bbox(b);
          update(b.geometry);
          $mapobject.fitBounds(bb, {padding: 40});
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
              : '';
          setDrawData();
          let opts = state.name ? {areaName: state.name} : {};
          analyticsEvent({event: "geoUpload", ...opts});
        }
      };
      reader.readAsText(file);
    }
  }

  onMount(init);

  /* 
The save data and continue function
*/
  async function savedata() {
    document.querySelector('#mapcontainer div canvas').style.cursor = 'wait';

    return $centroids
      .simplify(state.name, $selected[$selected.length - 1], $mapobject)

      .then((q) => {
        if (q) {
          const items = $selected[$selected.length - 1];

          if (items.oa.size > 0) {
            if (q.error) return false;

            console.debug('buildpage', q);
            localStorage.setItem('onsbuild', JSON.stringify(q));
            document.querySelector('#mapcontainer div canvas').style.cursor =
              'auto';
            return true;
          }
        }

        alert('No features selected.');
        document.querySelector('#mapcontainer div canvas').style.cursor =
          'auto';
        return false;
      });
  }

  function updateDrawMode(mode) {
    let draw_type_new = mode === "move" ? null : mode;
    if ($draw_type !== draw_type_new) {
      $draw_type = draw_type_new;
      state.select = "add";
    }
  }
  $: updateDrawMode(state.mode);

  function updateAddSubtract(select) {
    $add_mode = select === "add" ? true : false;
  }
  $: updateAddSubtract(state.select);

  // $: console.log('selected', $selected);
</script>

<ONSloader {isLoading} />
<nav>
  <div class="nav-left" style="z-index:99;">
    {#each modes as mode}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <label
        id={'init_' + mode.key}
        class:active={state.mode == mode.key}
        class:disabled={zoom < zoomstop}
        title={mode.label}
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
        style:color="lightgray"
        style:filter="invert(.2)contrast(2)"
        on:click={() => {
          advanced = true;
        }}
      >
        Further Tools
      </button>
    {/if}

    <button
      class="alert"
      title="Clear all areas"
      use:tooltip
      on:click={() => {
        newselect();
        state.name = '';
      }}
    >
      <Icon type="clear" />
    </button>

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
      class="text confirm"
      disabled={!$selected[$selected.length - 1].oa.size > 0}
      on:click={() => {
        isLoading = true;
        savedata().then((rdir) => {
          // console.warn(rdir);
          if (rdir) {
            goto(`${base}/build/`);
          } else {
            console.error('not redirecting', rdir);
            isLoading = false;
          }
        })
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
      <input type="text" class="input-text" bind:value={state.name} placeholder="Type your area name" />
      <button
        class="text"
        on:click={async () => {
          let data = await $centroids.simplify(state.name, $selected[$selected.length - 1], $mapobject);
          let blob = geo_blob(data);
          download(blob, `${state.name ?state.name.replaceAll(' ', '_') : 'custom_area'}.geojson`);
          state.showSave = false;
          let opts = state.name ? {areaName: state.name} : {};
          analyticsEvent({event: "fileDownload", fileExtension: "json", ...opts});
        }}>
        <Icon type="download" /><span>Save geography</span>
      </button>
      <button
        class="text"
        on:click={() => {
          clip(
            Array.from($selected[$selected.length - 1].oa).join(','),
            'Copied output area codes to clipboard'
          );
          state.showSave = false;
          let opts = state.name ? {areaName: state.name} : {};
          analyticsEvent({event: "geoCopy", ...opts});
        }}>
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
        <input type="text" class="input-text" bind:value={$radiusInKm} />km
      </div>
    {/if}
    <div class="select-mode">
      <span>Selection mode </span>
      <label
        class:active={state.select === 'add'}
        title="Add to selection"
        use:tooltip
      >
        <input
          type="radio"
          bind:group={state.select}
          name="select"
          value="add"
        />
        <Icon type="select_add" />
      </label>
      <label
        class:active={state.select === 'subtract'}
        title="Remove from selection"
        use:tooltip
      >
        <input
          type="radio"
          bind:group={state.select}
          name="select"
          value="subtract"
        />
        <Icon type="select_subtract" />
      </label>
    </div>
  </nav>
{/if}
<div id="map">
  <Map drawing_tools={true} />
</div>
<aside class="info-box" style:top="{showTray || state.showSave ? 200 : 158}px">
  <div class="search">
    <Select
      on:select={(e) => {
        newselect();

        if (e.detail.type == 'place') {
          let bbox = e.detail.bbox;
          let oa = new Set($centroids.expand(e.detail.codes));
          $selected = [
            $selected,
            { oa },
          ];
          $mapobject.fitBounds(bbox, {padding: 40});
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
              { oa },
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
      style:display="none"
      bind:this={uploader}
      on:input={load_geo}
    />
  </div>
  {#if state.infoExpand}
    <div class="message">
      {#if (!zoom || zoom < zoomstop) && $selected[$selected.length - 1].oa.size > 0}
        <strong>Zoom in to continue</strong><br />
        You can
        <button
          class="btn-link"
          on:click={() => {
            let q = $selected[$selected.length - 1];
            let bbox = $centroids.bounds([...q.oa]);
            $mapobject.fitBounds(bbox, {padding: 40});
          }}>click here</button
        > to return to the area you have drawn.
      {:else if !zoom || zoom < zoomstop}
        <strong>How to get started</strong><br />
        Zoom in to an area on the map to start drawing, or use the search box above
        to find a ready-made area.
        <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/articles/buildacustomareaprofile/2023-01-17" target="_blank" rel="noreferrer">Read more</a>
        <span style:font-size="0.8em" style:margin-left="2px"><Icon type="launch"/></span>
      {:else if state.mode == 'polygon'}
        <strong>Draw a polygon mode</strong>
        <span style='color:gray;margin:auto;width:auto;float:right;vertical-align:sup'> {state.select=='add'?'+':'–'}
          <Icon type={state.mode} />
        </span>
        <br />
        Click on the map to draw a polygon. Click again on the first or last point
        to close the polygon.
      {:else if state.mode == 'radius'}
        <strong>Draw a radius mode</strong> <span style='color:gray;margin:auto;width:auto;float:right;vertical-align:sup'> {state.select=='add'?'+':'–'}
          <Icon type={state.mode} />
        </span><br />
        Select a radius in kilometres from the menu, then click on the map to draw
        a circle.
      {:else if state.mode == 'select'}
        <strong>Click and select mode</strong> <span style='color:gray;margin:auto;width:auto;float:right;vertical-align:sup'> 
          <Icon type={state.mode} />
        </span><br />
        Click an individual area to add or remove it from your selection.
      {:else}
        <strong>Pan and zoom mode</strong> <span style='color:gray;margin:auto;width:auto;float:right;vertical-align:sup'> 
          <Icon type={state.mode} />
        </span><br />
        Explore the map to find a location of interest, then select a drawing tool
        from the menu.
      {/if}
      <br />
    </div>
  {/if}
  <div class="population">
    <span>
      {#if pselect}
        Population selected: <strong>{roundCount(pselect).toLocaleString('en-GB')}</strong>
      {:else}
        No areas selected
      {/if}
    </span>
    <button
      on:click={() => (state.infoExpand = !state.infoExpand)}
      title={state.infoExpand ? 'Hide info' : 'Show info'}
      use:tooltip
    >
      <Icon type="chevron" rotation={state.infoExpand ? 90 : -90} />
    </button>
  </div>
</aside>