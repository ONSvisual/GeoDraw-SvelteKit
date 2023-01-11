<script context="module">
  import { csvParse, autoType } from "d3-dsv";
  import { analyticsEvent } from "$lib/layout/AnalyticsBanner.svelte";
  import Pbf from "pbf";
  import vt from "@mapbox/vector-tile";
  import tb from "@mapbox/tilebelt";
  import inPolygon from "@turf/boolean-point-in-polygon";

	// Config for places data
  const baseurl = "https://cdn.ons.gov.uk/maptiles/cp-geos/v1";
  const geotypes = [
    {keys: ["E00", "W00"], label: "Output area"},
    {keys: ["E01", "W01"], label: "LSOA"},
    {keys: ["E02", "W02"], label: "MSOA"},
    {keys: ["E04", "W04"], label: "Parish"},
    {keys: ["E05", "W05"], label: "Ward"},
    {keys: ["E06", "W06"], label: "Unitary authority"},
    {keys: ["E07", "E08"], label: "Local authority district"},
    {keys: ["E09"], label: "London borough"},
    {keys: ["E10"], label: "County"},
    {keys: ["E11"], label: "Metropolitan county"},
    {keys: ["E14", "W07"], label: "Parliamentary constituency"},
    {keys: ["E30", "K01", "W22"], label: "Travel to work area"},
    {keys: ["E34", "K05", "W37"], label: "Built-up area"},
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
		let data = await getData(`${baseurl}/places-list.csv`);
    data = data.filter(d => d.areanm); // Hack for faulty areas. Filter out rows without a name
    let lookup = {};
    data.forEach(d => lookup[d.areacd] = d);
		data.forEach(d => {
      let geotype = geotypes_lookup[d.areacd.slice(0,3)];
      d.group = d.parent ? `${geotype} in ${lookup[d.parent].areanm}` : geotype;
    });
		data.sort((a, b) => a.areanm.localeCompare(b.areanm));
		return data;
	}

	// Get boundary, bbox and output area lookup
	export async function getPlace(code) {
    let geo;
    try {
      let geo_raw = await fetch(`${baseurl}/${code.slice(0,3)}/${code}.json`);
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
      geometry: geo.geometry,
      bbox: geo.properties.bounds,
      codes: geo.properties.codes
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
    const url = `https://cdn.ons.gov.uk/maptiles/administrative/2021/oa/v2/boundaries/${tile[2]}/${tile[0]}/${tile[1]}.pbf`;
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

  export let autoClear = true;
  export let placeholder = "Find an area or postcode";
  export let listMaxHeight = 250;
	
	// Data and state for select box
	let items;
	let filterText;
	
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
			return items.filter(p => p.areanm.toLowerCase().slice(0, filterText.length) == filterText.toLowerCase());
		}
		return [];
	}
	async function doSelect(e) {
		if (e.detail.postcode) {
      let res = await fetch(`https://api.postcodes.io/postcodes/${e.detail.areacd}`);
			let json = await res.json();
			if (json.result) {
        let oa = await getOAfromLngLat(json.result.longitude, json.result.latitude);
        if (oa) dispatch('select', await getPlace(oa));
      }
		} else {
      dispatch('select', await getPlace(e.detail.areacd));
		}
	}
  
	onMount(async () => items = await getPlaces());
</script>

{#if items}
<Select id="select" mode="search" idKey="areacd" labelKey="areanm" groupKey="group" {items} {placeholder} {listMaxHeight} bind:filterText loadOptions={getOptions} on:select={doSelect} {autoClear}/>
{/if}