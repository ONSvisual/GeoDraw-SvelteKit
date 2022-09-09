<!-- <script>
  import 'carbon-components-svelte/css/white.css';
  import {Button} from 'carbon-components-svelte';
  import {hash, drawhash, embedurl} from '$lib/examplehash.js';
  import Select from '$lib/ui/Select.svelte'
  import OpenGraph from '$lib/OpenGraph.svelte';
import { onMount } from 'svelte';
import { base } from "$app/paths";
// import {csv} from 'd3-csv'


let places;
onMount(async ()=>


{   
    places = await csv(`${base}/data/places.csv`);
    places.sort((a, b) => a.areanm.localeCompare(b.areanm));
    let lookup = {};
		places.forEach(d => lookup[d.areacd] = d);})

  // Postcode multi-select
  let placeholder = 'Type a place name or postcode';
  let filterText = '';


  async function getPostcodes(filterText) {
    if (filterText.length > 2 && /\d/.test(filterText)) {
      let res = await fetch(
        `https://api.postcodes.io/postcodes/${filterText}/autocomplete`
      );
      let json = await res.json();
      return json.result.map((d) => ({areacd: d, areanm: d, postcode: true}));
    } else if (filterText.length > 2) {
      return places.filter(
        (p) =>
          p.areanm.toLowerCase().slice(0, filterText.length) ==
          filterText.toLowerCase()
      );
    }
    return [];
  }
  async function doSelect(e) {
    console.log(e.detail)

    if (e.detail.postcode) {
      let res = await fetch(
        `https://api.postcodes.io/postcodes/${e.detail.areacd}`
      );
      let json = await res.json();
      if (json.result) {

        console.log(json.result)
        let place = places.find(
          (p) => p.areacd == json.result.codes.admin_district
        );
        if (place) {
          if (window.dataLayer)
            window.dataLayer.push({
              event: 'postcodeSelect',
              name: place.areanm,
              code: place.areacd,
            });
          placeholder = 'Type a place name or postcode';
          alert(place.areacd);

          //NavTo

//////////////////////

        } else {
          placeholder = 'Postcode must be in England or Wales';
        }
      }
    } 
  }
//   function mapSelect(e) {
//     console.log(e.detail.feature.properties.areanm);
//     if (window.dataLayer)
//       window.dataLayer.push({
//         event: 'nameSelect',
//         name: e.detail.feature.properties.areanm,
//         code: e.detail.id,
//       });
//     navTo(e.detail.id);
//   }
</script>

<br /><br />
<OpenGraph print=true/>
<Select
  items={places}
  mode="search"
  idKey="areacd"
  labelKey="areanm"
  {placeholder}
  bind:filterText
  loadOptions={getPostcodes}
  autoClear
  on:select={doSelect}
/>

<Button href="/draw{drawhash}">draw</Button>
<Button kind="secondary" href="/build{hash}">build</Button>
<Button kind="tertiary" href="/embed{embedurl}">Embeded URL</Button>
<style>
  a {
    color: aliceblue;
  }
</style> -->
