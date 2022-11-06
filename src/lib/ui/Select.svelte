<script context="module">
  import { csvParse, autoType } from "d3-dsv";

	// Config for places data
  const baseurl = "https://cdn.ons.gov.uk/maptiles/cp-geos/v1";
  const geotypes = [
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
  let geotypes_lookup = {};
  geotypes.forEach(g => g.keys.forEach(k => geotypes_lookup[k] = g.label));

	async function getData(url) {
    let res = await fetch(url);
    return csvParse(await res.text(), autoType);
	}

	export async function getPlaces() {
		let data = await getData(`${baseurl}/places-list.csv`);
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
      console.log(err);
      return {type: null};
    }

    return {
      type: 'place',
      areanm: geo.properties.areanm,
      areacd: geo.properties.areacd,
      geometry: geo.geometry,
      bbox: geo.properties.bounds,
      codes: geo.properties.codes
    };
	}
</script>
<script>
  import { onMount, createEventDispatcher } from "svelte";
	import Select from "./SelectInner.svelte";

  const dispatch = createEventDispatcher();
	
	// Data and state for select box
	let items;
	const placeholder = "Find an area or postcode";
	let filterText;
	
  // Function for select box
	async function getOptions(filterText) {
		if (filterText.length > 2 && /\d/.test(filterText)) {
			let res = await fetch(`https://api.postcodes.io/postcodes/${filterText}/autocomplete`);
			let json = await res.json();
			return json.result ? json.result.map(d => ({areacd: d, areanm: d, group: '', postcode: true})) : [];
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
        dispatch('select', {
					type: "postcode",
					postcode: json.result.postcode,
					center: [json.result.longitude, json.result.latitude]
        })
			}
		} else {
      dispatch('select', await getPlace(e.detail.areacd));
		}
	}
  
	onMount(async () => items = await getPlaces());
</script>

{#if items}
<Select id="select" mode="search" idKey="areacd" labelKey="areanm" groupKey="group" {items} {placeholder} bind:filterText loadOptions={getOptions} on:select={doSelect} autoClear/>
{/if}