<script context="module">
  // Functions etc to retreive data from ONS Linked Geography API
	import bbox from '@turf/bbox';
	import wellknown from 'wellknown';

	// Config for places data
  const baseurl = "https://onsvisual.github.io/cp-places-data";
  const geotypes = [
    {keys: ["E05", "W05"], label: "Ward"},
    {keys: ["E06", "W06"], label: "Unitary authority"},
    {keys: ["E07", "E08"], label: "District"},
    {keys: ["E09"], label: "London borough"},
    {keys: ["E10"], label: "County"},
    {keys: ["E11"], label: "Metropolitan county"},
    {keys: ["E14", "W07"], label: "Parliamentary constituency"},
    {keys: ["E30", "K01", "W22"], label: "Travel to work area"},
    {keys: ["E34", "K05", "W37"], label: "Built-up area"},
    {keys: [], label: "Built-up area, sub-division"}
  ];

	async function getData(url) {
    let df = await dfd.readCSV(url, {skipEmptyLines: true});
		return dfd.toJSON(df);
	}

	export async function getPlaces() {
		let data = await getData(`${baseurl}/places_list.csv`);
		data.forEach(d => { d.group = d.group.substring(4) })
		data.sort((a, b) => a.areanm.localeCompare(b.areanm));
		return data;
	}

	// Get boundary, bbox and output area lookup
	export async function getPlace(code) {
		// Get boundary in WKT format
		const query_geo = `SELECT ?areanm ?geometry
WHERE {
  <http://statistics.data.gov.uk/id/statistical-geography/${code}> <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom ;
  <http://statistics.data.gov.uk/def/statistical-geography#officialname> ?areanm .
  ?geom <http://www.opengis.net/ont/geosparql#asWKT> ?geometry .
}
LIMIT 1`;
    let geo = await getData(apiurl + encodeURIComponent(query_geo));
    
    if (geo[0]) {
      // Convert polygon from WKT to geojson format
      let geojson = wellknown.parse(geo[0].geometry);

      // Get the lon/lat bounding box of the polygon
      let bounds = bbox(geojson);

      // Get output area lookup for selected geography
      const query_lookup = `SELECT DISTINCT ?areacd
WHERE {
  ?pcode <http://publishmydata.com/def/ontology/foi/within> <http://statistics.data.gov.uk/id/statistical-geography/${code}> ;
  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://statistics.data.gov.uk/def/postcode/unit> ;
  <http://statistics.data.gov.uk/def/spatialrelations/within#outputarea> ?area .
  ?area <http://publishmydata.com/def/ontology/foi/code> ?areacd ;
  <http://statistics.data.gov.uk/def/statistical-geography#status> "live" ;
}`;
      let lookup = await getData(apiurl + encodeURIComponent(query_lookup));

      return {
        type: 'place',
        areanm: geo[0].areanm,
        areacd: code,
        geometry: geojson,
        bbox: bounds,
        codes: lookup.map(d => d.areacd)
      };
    } else {
      return {type: null};
    }
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