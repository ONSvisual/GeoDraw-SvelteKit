<script>
  // imports
  import maplibregl from "maplibre-gl";

  maplibregl.workerCount = 5;
  maplibregl.maxParallelImageRequests = 20;

  import { onMount } from "svelte";
  import { initDraw } from "$lib/util/drawing-utils";
  import { mapsource, maplayer, mapObject } from "$lib/stores/mapstore";
  import { minzoom, maxzoom, maxbounds, mapstyle } from "$lib/config/geography";

  const mapboxgl = maplibregl;
  let webglCanvas;

  export let drawingTools = false;

  /// MAP creation
  async function init() {
    $mapObject = new mapboxgl.Map({
      container: "mapcontainer",
      style: mapstyle,
      minZoom: minzoom,
      maxZoom: maxzoom,
      maxBounds: maxbounds,
      //   pitch: 10, // 30,
      center: [-1, 52.2],
      zoom: 5,
      hash: false, // set options in hash string
    });

    document.querySelector("#mapcontainer div canvas").style.cursor = "wait";

    // scale bar
    $mapObject.addControl(
      new mapboxgl.ScaleControl({
        position: "bottom-left",
      }),
    );

    // navigation
    $mapObject.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    //disable double click and rotation
    $mapObject.doubleClickZoom.disable();
    $mapObject.dragRotate.disable();

    // // correct error - ignore 403 missing tiles
    $mapObject.on("error", (e) => {
      if (
        e.error.status != 403 &&
        e.error.message != "Failed to fetch" &&
        !/CORS/.test(e.error.message)
      ) {
        // console.error('--', e.error.status, e.error.message);
        return e;
      }
    });

    $mapObject.on("load", SetLayers);
  }

  // onDestroy(() => {
  //   if ($mapObject) $mapObject.remove();
  // });

  /// Set all Mapbox Parameters ///
  export async function SetLayers() {
    // set mapbox layers

    mapsource.subscribe(async () => {
      // set the sources
      for (const [key, value] of Object.entries($mapsource)) {
        // if ($mapObject.getSource(key)) $mapObject.removeSource(key);
        // if (value.hasOwnProperty('data')) value.data = await value.data; // for async loads
        if (!$mapObject.getSource(key)) $mapObject.addSource(key, value); // as it may nto be removable
      }
    });

    maplayer.subscribe(async () => {
      // set the layers
      for (const value of $maplayer) {
        if ($mapObject.getLayer(value.id)) $mapObject.removeLayer(value.id);
        $mapObject.addLayer(value, "small settlement names");
      }
    });

    if (drawingTools) await initDraw();
  }

  /// main
  onMount(init);
</script>

<div tabindex="0" aria-label="Map" id="mapcontainer" bind:this={webglCanvas} />

<style>
  #mapcontainer {
    position: absolute;
    top: 142px;
    bottom: 0;
    width: 100%;
  }
  :global(.maplibregl-ctrl button) {
    margin: 0;
  }
</style>
