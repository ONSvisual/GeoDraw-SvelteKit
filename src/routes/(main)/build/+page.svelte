<script>
  import ONSloader from '../ONSloader.svelte';
  let isLoading = false;
  import {goto} from '$app/nasimplifyvigation';
  import {base} from '$app/paths';
  import pym from 'pym.js';
  import tooltip from '$lib/ui/tooltip';
  import Icon from '$lib/ui/Icon.svelte';
  // import {default as datasets} from '$lib/util/custom_profiles_tables.json';
  import topics from '$lib/topics.json';
  import {simplify_geo, geo_blob} from '../draw/drawing_utils.js'; // "$lib/draw/MapDraw.js";
  // import {fauxdensity, get_pop, get_stats} from './gettable.js';
  import getTable from './gettable.js';
  import {download, clip} from '$lib/util/functions';
  import {onMount} from 'svelte';
  import { centroids } from '../draw/mapstore.js';

  // let dataset_keys = Object.keys(datasets);
  // dataset_keys = dataset_keys.filter(
  //   (key) => !/UK\]| - | by |\[[^K]|WA\]/.test(datasets[key].name)
  // ); // strip non k tables, welsh only, and bivariate tables
  // let name2key = Object.fromEntries(
  //   new Map(dataset_keys.map((d) => [datasets[d]['Table name'], d]))
  // );

  /////
  let pym_parent; // Variabl for pym
  let embed_hash; // Variable for embed hash string
  let tables = []; // Array to hold table data
  let includemap = true;

  let topicsLookup = (() => {
    let lookup = {};
    topics.forEach(t => lookup[t.code] = t);
    return lookup;
  })();


  // alert('00 oa 01 lsoa 02 msoa e.g.E00')

  let state = {
    mode: 'move',
    radius: 5,
    select: 'add',
    name: 'Area Name',
    showSave: false,
    showEmbed: false,
    topics: [topics[0]],
    topicsExpand: false,
    topicsFilter: '',
  };

  function filterTopics(topics, selected, regex, expand) {
    /// display only those which exist
    let topics_start = [];
    let topics_end = [];
    [...topics]
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach((topic) => {
        if (selected.includes(topic)) {
          topics_start.push(topic);
        } else {
          topics_end.push(topic);
        }
      });
    if (regex) topics_end = topics_end.filter((t) => regex.test(t.label));
    return [...topics_start, ...topics_end];
  }

  function highlight(str, regex) {
    return regex ? str.replace(regex, '<mark>$&</mark>') : str;
  }

  $: regex =
    state.topicsFilter.length > 1 ? new RegExp(state.topicsFilter, 'i') : null;

  let store;
  let geojson;

  async function init() {
    isLoading = true;

    // in case we call for a pre loaded area as a hash string
    let hash = window.location.hash;
    if (hash === '#undefined') {
      hash = '';
      window.location.hash = '';
    } else if (hash.length == 10) {
      let code = hash.slice(1);
      try {
        let data = await (
          await fetch(
            `https://cdn.ons.gov.uk/maptiles/cp-geos/v1/${code.slice(
              0,
              3
            )}/${code}.json`
          )
        ).json();
        let comp = $centroids.compress(data.properties.codes);
        console.log(comp);
        const info = {
          compressed: [...comp.msoa, ...comp.lsoa, ...comp.oa].join(";"),
          geojson: data,
          properties: {
            oa_all: data.properties.codes,
            oa: comp.oa,
            lsoa: comp.lsoa,
            msoa: comp.msoa,
            name: data.properties.areanm
              ? data.properties.areanm
              : data.properties.areacd,
          },
        };

        localStorage.setItem('onsbuild', JSON.stringify(info));
      }
      catch (err) {
        console.warn(err);
        alert(`Requested GSS code ${code} is unavailable or invalid.`);
      }
    }
    history.replaceState(null, null, ' ');

    // resume as normal
    store = JSON.parse(localStorage.getItem('onsbuild'));

    console.debug('build-', store);
    if (!store) {
      alert('Warning, no area selected! Redirecting to the drawing page.');
      goto(`${base}/draw/`);
    }

    geojson = simplify_geo(store.geojson.geometry);

    state.name = store.properties.name;
    state.start = true;

    let props = store.properties;
    console.log("props", props);

    state.compressed =
      store.compressed ||
      [
        ...props.msoa,
        ...props.lsoa,
        ...props.oa,
    ]
        .flat()
        .join(';');


  
    console.warn(state.compressed)
   
    // var senddata = {
    // 	tables: tlist,
    // 	areas: alist,
    // 	compressed,
    // 	polygon: polygon,
    // };

    // console.debug(stats,population)


    setTimeout(() => {
      update_profile(
        state.start,
        state.name,
        state.topics,
        includemap
      );

      isLoading = false;
    }, 1000);
  }

  onMount(init);
  // $: get_data(state.topics);

  ////////////////////////////////////////////////////////////////
  // Processing functions
  ////////////////////////////////////////////////////////////////
  let cache = {};
  async function get_data(data) {
    if (!state.start) return [];
    let tables = [];
    for (let i = 0; i < data.length; i ++) {
      let table = await getTable(data[i], state.compressed);
      tables.push({code: data[i].code, data: table});
    }
    console.log(tables);
    return tables;
  }

  async function update_profile(
    start,
    name,
    data,
    includemap,
  ) {
    if (start) {
      var ls = JSON.parse(localStorage.getItem('onsbuild'));
      ls.properties.name = name;
      localStorage.setItem('onsbuild', JSON.stringify(ls));

      let codes = data.map(d => d.code);
      tables = await get_data(topics.filter(t => codes.includes(t.code)));

      embed_hash = `#/?name=${btoa(name)}&tabs=${btoa(
        JSON.stringify(tables)
      )}${includemap ? `&poly=${btoa(JSON.stringify(geojson))}` : ''}`;

      // alert(population)

      if (!pym_parent) {
        pym_parent = new pym.Parent('embed', `${base}/embed/${embed_hash}`, {
          name: 'embed',
          id: 'iframe',
        });
      } else {
        document.getElementById('iframe').contentWindow.location.hash =
          embed_hash;
      }
    }
  }

  $: update_profile(
    state.start,
    state.name,
    state.topics,
    includemap,
  );

  function makeEmbed(embed_hash) {
    let url = `${base}/embed/${embed_hash}`;
    return `<div id="profile"></div>
<script src="http://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"><\/script>
<script>var pymParent = new pym.Parent("profile", "${url}", {name: "profile"});<\/script>`;
  }
</script>

<ONSloader {isLoading} />
<nav>
  <div class="nav-left">
    <button
      class="text"
      on:click={() => goto(`${base}/draw/${'#' + (store.compressed || '')}`)}
    >
      <Icon type="chevron" rotation={180} /><span>Edit area</span>
    </button>
  </div>
  <div class="nav-right">
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
          let blob = geo_blob(store);
          download(blob, `${state.name.replace(' ', '_')}.json`);
        }}
      >
        <Icon type="download" /><span>Save geography</span>
      </button>
      <button
        class="text"
        on:click={() =>{
          var codes = store.properties.oa_all.join(',');
          clip(
            codes,
            'Copied output area codes to clipboard'
          )
          console.log(codes)
          console.log('codes copied to clipboard')
          }}
      >
        <Icon type="copy" /><span>Copy area codes</span>
      </button>
    </div>
  </nav>
{/if}
<div class="container">
  <aside class="topics-box">
    <h2>Name your area</h2>
    <input type="text" bind:value={state.name} placeholder="Type a name" />

    <p style="font-weight:bold">Area Profiles</p>

    <label>
      <input type="checkbox" bind:checked={includemap} />
      Include Map
    </label>

    <h2>Select topics</h2>
    <input
      type="text"
      placeholder="Type to filter"
      bind:value={state.topicsFilter}
    />
    {#each filterTopics(topics, state.topics, regex, state.topicsExpand) as topic, i}
      <label style:display={i < 6 || state.topicsExpand ? null : 'none'}>
        <input
          type="checkbox"
          bind:group={state.topics}
          name="topics"
          value={topic}
        />
        {@html highlight(topic.label, regex)}
      </label>
    {/each}
    {#if !regex}
      <button on:click={() => (state.topicsExpand = !state.topicsExpand)}>
        {state.topicsExpand ? 'Show fewer' : `Show ${topics.length - 6} more`}
      </button>
    {/if}
  </aside>
  <article class="profile">
    <h2>Profile preview</h2>

    <div id="embed" />
    <div class="embed" style="height:.08em!important;padding:0">
      <!-- <h3>{state.name}</h3> -->
    </div>
    <div class="embed-actions">
      <button
        on:click|preventDefault={() => {
          state.showEmbed = !state.showEmbed;

          setTimeout(() => {
            const el = document.querySelector('textarea');
            if (!el) return;

            el.scrollIntoView({
              behavior: 'smooth',
            });
          });
        }}
      >
        {state.showEmbed ? 'Hide embed code' : 'Show embed code'}
      </button>
      <button on:click={() => pym_parent.sendMessage('makePNG', null)}>
        Download PNG
      </button>
      <button
        disabled={!state.topics}
        on:click={async function () {
          let csv = `"Custom area profile data for ${state.name}"\n`;
          csv += `"Source: Census 2021, Office for National Statistics"\n`;
          csv += `"Data generated by the ONS Build a custom area profile tool on ${(new Date()).toLocaleDateString('en-GB', {year: "numeric", month: "short", day: "numeric"})}"\n\n`;
          csv += `"Variable","Category","${state.name}","England and Wales","Unit"\n`;

          tables.forEach(t => {
            let meta = topicsLookup[t.code];
            let len = meta.categories.length;
            for (let i = 0; i < len; i ++) {
              csv += `"${meta.label}","${meta.categories[i].label}",${t.data[i]},${t.data[len + i]},"${meta.unit}"\n`;
            }
          });
          var file = new Blob([csv], {type: 'text/csv'});
          download(file, state.name.replace(' ', '_') + '.csv');

          // console.log(pretty);
        }}>Download Data</button
      >
      {#if embed_hash && state.showEmbed}
        <p style:margin-bottom={0}>Embed code</p>
        <textarea>{makeEmbed(embed_hash)}</textarea>
      {/if}
    </div>
  </article>
</div>

<style>
  .profile {
    flex-grow: 1;
  }
  .embed {
    display: block;
    width: auto;
    height: auto;
    padding: 30px;
    margin-bottom: 10px;
    background-color: rgba(119, 136, 153, 0.105);
  }
  .container {
    margin-right: 16px;
    max-width: none;
  }

  :global(#lmap) {
    filter: invert(0.9);
    opacity: 0.9;
  }

  .embed-actions textarea {
    width: 100%;
    height: 100px;
    resize: none;
  }
</style>
