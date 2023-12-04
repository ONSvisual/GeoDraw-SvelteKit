<script context="module">
  import { base } from "$app/paths";
  import { cdnbase } from "$lib/config/geography";
  import { csvParse, autoType } from "d3-dsv";
  import { analyticsEvent } from "$lib/layout/AnalyticsBanner.svelte";
  import Pbf from "pbf";
  import vt from "@mapbox/vector-tile";
  import tb from "@mapbox/tilebelt";
  import inPolygon from "@turf/boolean-point-in-polygon";

	// Config for places data
  const geotypes = [
    {keys: ["E00", "W00"], label: "Output area"},
    {keys: ["E01", "W01"], label: "LSOA"},
    {keys: ["E02", "W02"], label: "MSOA"},
    {keys: ["E04"], label: "Parish"},
    {keys: ["W04"], label: "Community"},
    {keys: ["E05", "W05"], label: "Ward"},
    {keys: ["E06", "W06"], label: "Unitary authority"},
    {keys: ["E07"], label: "Non-metropolitan borough"},
    {keys: ["E08"], label: "Metropolitan borough"},
    {keys: ["E09"], label: "London borough"},
    {keys: ["E10"], label: "County"},
    {keys: ["E11"], label: "Metropolitan county"},
    {keys: ["E47"], label: "Combined authority"},
    {keys: ["E12"], label: "Region"},
    {keys: ["E92", "W92"], label: "Country"},
    {keys: ["K04"], label: ""},
    {keys: ["E14", "W07"], label: "Parliamentary constituency"},
    {keys: ["W09"], label: "Senedd constituency"},
    {keys: ["W10"], label: "Senedd electoral region"},
    {keys: ["E30", "K01", "W22"], label: "2011 Travel to work area"},
    {keys: ["E34", "K05", "W37", "E63", "K08", "W45"], label: "Built-up area"},
    {keys: ["E35", "K06", "W38"], label: "Built-up area, sub-division"}
  ];
  export const geotypes_lookup = (() => {
    let lookup = {};
    geotypes.forEach(g => g.keys.forEach(k => lookup[k] = g.label));
    return lookup;
  })();

	async function getData(url) {
    let res = await fetch(url);
    return csvParse(await res.text(), autoType);
	}

	export async function getPlaces() {
		let data = await getData(`${base}/data/places-list.csv`);
    data = data.filter(d => d.areanm); // Hack for faulty areas. Filter out rows without a name
    let lookup = {};
    data.forEach(d => lookup[d.areacd] = d);
		data.forEach(d => {
      let geocd = d.areacd.slice(0,3);
      let geotype = geotypes_lookup[geocd];
      // Fix for 2025 parliamentary constituencies
      if (["E14", "W07"].includes(geocd)) {
        if (
          (geocd === "E14" && +d.areacd.slice(3) > 1062) ||
          (geocd === "W07" && +d.areacd.slice(3) > 80)
        ) geotype = `Future ${geotype.toLowerCase()}`;
        else geotype = `Current ${geotype.toLowerCase()}`;
      }
      d.group = d.parentcd ? `${geotype} in ${lookup[d.parentcd].areanm}` : geotype;
    });
		data.sort((a, b) => a.areanm.localeCompare(b.areanm));
		return data;
	}

	// Get boundary, bbox and output area lookup
	export async function getPlace(code, group = "") {
    let geo;
    try {
      let geo_raw = await fetch(`${cdnbase}/${code.slice(0,3)}/${code}.json`);
      geo = await geo_raw.json();
    }
    catch(err) {
      // console.log(err);
      return {type: null};
    }

    let place = {
      type: 'place',
      areanm: geo.properties.areanm ? geo.properties.areanm : geo.properties.areacd,
      areacd: geo.properties.areacd,
      group,
      geometry: geo.geometry,
      bbox: geo.properties.bounds,
      codes: geo.properties.c21cds
    };

    analyticsEvent({
      event: "searchSelect",
      areaCode: place.areacd,
      areaName: place.areanm,
      areaType: geotypes_lookup[place.areacd.slice(0, 3)]
    });

    return place;
	}

  export async function getOAfromLngLat(lng, lat) {
    const tile = tb.pointToTile(lng, lat, 12);
    const url = `https://cdn.ons.gov.uk/maptiles/administrative/2021/oa/v3/boundaries/${tile[2]}/${tile[0]}/${tile[1]}.pbf`;
    try {
      const geojson = await getTileAsGeoJSON(url, tile);
      const pt = { type: "Point", coordinates: [lng, lat] };
      for (const f of geojson.features) {
        if (inPolygon(pt, f.geometry)) return f.properties.areacd;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function getTileAsGeoJSON(url, tile) {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const pbf = new Pbf(buf);
    const geojson = { type: "FeatureCollection", features: [] };
    const t = new vt.VectorTile(pbf);
    for (const key in t.layers) {
      for (let i = 0; i < t.layers[key].length; i++) {
        geojson.features.push(t.layers[key].feature(i).toGeoJSON(...tile));
      }
    }
    return geojson;
  }
</script>
<script>
  import { onMount, createEventDispatcher } from "svelte";
	import Select from "./SelectInner.svelte";

  const dispatch = createEventDispatcher();

  export let value = null;
  export let autoClear = true;
  export let placeholder = "Find an area or postcode";
  export let listMaxHeight = 250;
  export let mode = "search";
  export let isClearable = false;
	
	// Data and state for select box
	let items;
	let filterText;

  const startsWithFilter = (str, filter) => str.toLowerCase().startsWith(filter.toLowerCase());
	const filterSort = (a, b) => startsWithFilter(a.areanm, filterText) && startsWithFilter(b.areanm, filterText) ? 0 :
		!startsWithFilter(a.areanm, filterText) && startsWithFilter(b.areanm, filterText) ? 1 :
		startsWithFilter(a.areanm, filterText) && !startsWithFilter(b.areanm, filterText) ? -1 : 0;
	
  // Function for select box
	async function getOptions(filterText) {
		if (filterText.length > 2 && /\d/.test(filterText)) {
			let res = await fetch(`https://api.postcodes.io/postcodes/${filterText}/autocomplete`);
			let json = await res.json();
			return json.result ? json.result.map(d => ({
        areacd: d,
        areanm: d,
        group: '',
        postcode: true
      })) : [];
		} else if (filterText.length > 2) {
			return items.filter(p => p.areanm.match(new RegExp(`\\b${filterText}`, 'i')))
        .sort(filterSort);
		}
		return [];
	}
	async function doSelect(e) {
		if (e?.detail?.group === "Uploaded area") return;
    if (e.detail.postcode) {
      let res = await fetch(`https://api.postcodes.io/postcodes/${e.detail.areacd}`);
			let json = await res.json();
			if (json.result) {
        let oa = await getOAfromLngLat(json.result.longitude, json.result.latitude);
        if (oa) dispatch('select', await getPlace(oa, "Output area"));
      }
		} else {
      dispatch('select', await getPlace(e.detail.areacd, e.detail.group));
		}
	}
  
	onMount(async () => items = await getPlaces());
</script>

{#if items}
<Select id="select" {mode} idKey="areacd" labelKey="areanm" groupKey="group" {items} {placeholder} {listMaxHeight} bind:value bind:filterText loadOptions={getOptions} on:select={doSelect} on:clear {isClearable} {autoClear}/>
{/if}