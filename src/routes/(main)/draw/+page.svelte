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
  import {update, simplifyGeo, geoBlob} from '$lib/util/drawing-utils';
  import {roundCount} from '$lib/util/functions';
  import {
    mapObject,
    drawType,
    addMode,
    radiusInKm,
    selected,
    centroids
  } from '$lib/stores/mapstore';
  import {boundaries, cdnbase} from '$lib/config/geography';
  import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';

  const modes = [
    {key: 'move', label: 'Pan and zoom'},
    {key: 'select', label: 'Click to select'},
    {key: 'polygon', label: 'Draw a polygon'},
    {key: 'radius', label: 'Draw a radius'},
  ];

  // variable custom testing
  let isLoading = false;
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

    function recolour(selected) {
      const items = selected[selected.length - 1];

      pselect = items.oa.size
        ? [...items.oa]
            .map((d) => $centroids.population(d) || 0)
            .reduce((a, b) => a + b)
        : 0;

      // if (!items.oa.size) return;
      // console.debug('---recolour', items);
      if ($mapObject.getLayer('bounds'))
        $mapObject.setPaintProperty('bounds', 'fill-color', [
          'match',
          ['get', 'areacd'],
          ['literal', ...items.oa],
          'rgba(32, 96, 149, 0.4)',
          'transparent',
        ]);
      if (selected.length > 1 && state.name) state.name = "";
    }

    $mapObject.on('load', async () => {
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

          $mapObject.fitBounds(data.properties.bounds, {padding: 40});

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

        $mapObject.fitBounds(bbox, {
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

        $mapObject.fitBounds(bbox, {
          padding: 40,
          linear: true,
        });

        q.oa = new Set(q.oa);
        selected.set([q]);
      }

      // Keep track of map zoom level
      zoom = $mapObject.getZoom();
      $mapObject.on('moveend', () => (zoom = $mapObject.getZoom()));
      isLoading = false;
    });

    selected.subscribe(recolour);
    recolour($selected);
  } //endinit

  function loadGeo() {
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
          $mapObject.fitBounds(bb, {padding: 40});
        } else if (b.geometry) {
          if (JSON.stringify(b.geometry).length > 10000) b.geometry = simplifyGeo(b.geometry, 10000);
          let bb = bbox(b);
          update(b.geometry);
          $mapObject.fitBounds(bb, {padding: 40});
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
      .simplify(state.name, $selected[$selected.length - 1], $mapObject)

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
    let drawTypeNew = mode === "move" ? null : mode;
    if ($drawType !== drawTypeNew) {
      $drawType = drawTypeNew;
      state.select = "add";
    }
  }
  $: updateDrawMode(state.mode);

  function updateAddSubtract(select) {
    $addMode = select === "add" ? true : false;
  }
  $: updateAddSubtract(state.select);

  // $: console.log('selected', $selected);

  function doSelect(e) {
    newselect();

    if (e.detail.type == 'place') {
      let bbox = e.detail.bbox;
      let oa = new Set($centroids.expand(e.detail.codes));
      $selected = [
        $selected,
        { oa },
      ];
      $mapObject.fitBounds(bbox, {padding: 40});
      state.name = e.detail.areanm;
    } else if (e.detail.type == 'postcode') {

      let center = e.detail.center;
      $mapObject.flyTo({center: center, zoom: 14});
      $mapObject.once('idle', () => {
        let coords = $mapObject.project(center);
        let features = $mapObject.queryRenderedFeatures(
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
  }
</script>

<ONSloader {isLoading} />
<nav>
  <div class="nav-left" style:z-index={99}>
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
          let data = await $centroids.simplify(state.name, $selected[$selected.length - 1], $mapObject);
          let blob = geoBlob(data);
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
        <Icon type="selectAdd" />
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
        <Icon type="selectSubtract" />
      </label>
    </div>
  </nav>
{/if}
<div id="map">
  <Map drawingTools={true} />
</div>
<aside class="info-box" style:top="{showTray || state.showSave ? 200 : 158}px">
  <div class="search">
    <Select
      on:select={doSelect}
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
      on:input={loadGeo}
    />
  </div>
  {#if state.infoExpand}
    <div class="message">
      {#if (!zoom || zoom < zoomstop) && $selected[$selected.length - 1].oa.size > 0}
        <strong role="status">Zoom in to continue</strong><br />
        You can
        <button
          class="btn-link"
          on:click={() => {
            let q = $selected[$selected.length - 1];
            let bbox = $centroids.bounds([...q.oa]);
            $mapObject.fitBounds(bbox, {padding: 40});
          }}>click here</button
        > to return to the area you have drawn.
      {:else if !zoom || zoom < zoomstop}
        <strong role="status">How to get started</strong><br />
        Zoom in to an area on the map to start drawing, or use the search box above
        to find a ready-made area.
        <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/articles/buildacustomareaprofile/2023-01-17" target="_blank" rel="noreferrer">Read more</a>
        <span style:font-size="0.8em" style:margin-left="2px"><Icon type="launch"/></span>
      {:else if state.mode == 'polygon'}
        <strong role="status">Draw a polygon mode</strong>
        <span class="mode-icon"> {state.select=='add'?'+':'–'}
          <Icon type={state.mode} />
        </span>
        <br />
        Click on the map to draw a polygon. Click again on the first or last point
        to close the polygon.
      {:else if state.mode == 'radius'}
        <strong role="status">Draw a radius mode</strong> <span class="mode-icon"> {state.select=='add'?'+':'–'}
          <Icon type={state.mode} />
        </span><br />
        Select a radius in kilometres from the menu, then click on the map to draw
        a circle.
      {:else if state.mode == 'select'}
        <strong role="status">Click and select mode</strong> <span class="mode-icon"> 
          <Icon type={state.mode} />
        </span><br />
        Click an individual area to add or remove it from your selection.
      {:else}
        <strong role="status">Pan and zoom mode</strong> <span class="mode-icon"> 
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