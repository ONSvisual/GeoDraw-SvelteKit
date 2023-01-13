<script>
  import ONSloader from '../ONSloader.svelte';
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';
	import {flip} from 'svelte/animate';
  import pym from 'pym.js';
  import tooltip from '$lib/ui/tooltip';
  import Notice from '$lib/ui/Notice.svelte';
  import TopicItem from '$lib/ui/TopicItem.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import topics from '$lib/topics.json';
  import {simplify_geo, geo_blob} from '../draw/drawing_utils.js';
  import getTable from './gettable.js';
  import {download, clip} from '$lib/util/functions';
  import {onMount} from 'svelte';
  import {centroids} from '../draw/mapstore.js';
  import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';
  let isLoading = false;
  let pym_parent; // Variabl for pym
  let embed_hash; // Variable for embed hash string
  let tables = []; // Array to hold table data
  let includemap = true;

  let topicsLookup = Object.fromEntries(topics.map(d=>[d.code,d]))
  // would this not be better off as a MAP and not a dict?

  // (() => {
  //   let lookup = {};
  //   topics.forEach((t) => (lookup[t.code] = t));
  //   return lookup;
  // })();


  let state = {
    mode: 'move',
    radius: 5,
    select: 'add',
    name: '',
    showSave: false,
    showEmbed: false,
    topics: [topics[0]],
    topicsExpand: false,
    topicsFilter: '',
  };

  function filterTopics(topics, selected, regex) {
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
        let res = await fetch(
          `https://cdn.ons.gov.uk/maptiles/cp-geos/v1/${code.slice(
            0,
            3
          )}/${code}.json`
        );
        let data = await res.json();
        let comp = $centroids.compress(data.properties.codes);
        const info = {
          compressed: [...comp.msoa, ...comp.lsoa, ...comp.oa].join(';'),
          geojson: data,
          properties: {
            oa_all: data.properties.codes,
            oa: comp.oa,
            lsoa: comp.lsoa,
            msoa: comp.msoa,
            name: data.properties.hclnm
              ? data.properties.hclnm
              : data.properties.areanm
              ? data.properties.areanm
              : code,
          },
        };
        localStorage.setItem('onsbuild', JSON.stringify(info));
        analyticsEvent({
          event: "hashSelect",
          areaCode: code,
          areaName: info.properties.name
        });
      } catch (err) {
        // console.warn(err);
        alert(`Requested GSS code ${code} is unavailable or invalid.`);
      }
      history.replaceState(null, null, ' ');
    }

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
    // console.log('props', props);

    state.compressed =
      store.compressed ||
      [...props.msoa, ...props.lsoa, ...props.oa].flat().join(';');

    // console.warn(state.compressed);
  }

  onMount(init);

  ////////////////////////////////////////////////////////////////
  // Processing functions
  ////////////////////////////////////////////////////////////////
  let cache = {};
  async function get_data(data) {
    if (!state.start) return [];
    let tables = [];
    for (let i = 0; i < data.length; i++) {
      let table;
      if (cache[data[i].code]) {
        table = cache[data[i].code];
      } else {
        table = await getTable(data[i], state.compressed);
        cache[data[i].code] = table;
      }
      tables.push({code: data[i].code, data: table});
    }
    // console.log(tables);
    return tables;
  }

  async function update_profile(start, name, data, includemap) {
    if (start) {
      var ls = JSON.parse(localStorage.getItem('onsbuild'));
      ls.properties.name = name;
      localStorage.setItem('onsbuild', JSON.stringify(ls));

      let codes = data.map((d) => d.code);
      tables = await get_data(topics.filter((t) => codes.includes(t.code)));

      embed_hash = `#/?name=${btoa(name)}&tabs=${btoa(JSON.stringify(tables))}${
        includemap ? `&poly=${btoa(JSON.stringify(geojson))}` : ''
      }`;

      // alert(population)

      if (!pym_parent) {
        pym_parent = new pym.Parent('embed', `${base}/embed/${embed_hash}`, {
          name: 'embed',
          id: 'iframe',
        });
        isLoading = false;
      } else {
        document.getElementById('iframe').contentWindow.location.hash =
          embed_hash;
      }
    }
  }

  function getName(mode = null) {
    let name = state.name ? state.name : 'selected area';
    return mode === "capitalise" ? name[0].toUpperCase() + name.slice(1) : name;
  }

  $: update_profile(state.start, state.name, state.topics, includemap);

  function makeEmbed(embed_hash) {
    let url = `https://www.ons.gov.uk/visualisations/customprofiles/embed/${embed_hash}`;
    return `<div id="custom-profile"></div>
<script src="http://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"><\/script>
<script>var pymParent = new pym.Parent("custom-profile", "${url}", {name: "custom-profile"});<\/script>`;
  }

  async function downloadData() {
    let csv = `"Custom area profile data for ${getName()}"\n`;
    csv += `"Source: Office for National Statistics - Census 2021"\n\n`;
    csv += `"Data generated by the Build a custom area profile tool on ${new Date().toLocaleDateString(
      'en-GB',
      {year: 'numeric', month: 'short', day: 'numeric'}
    )}"\n`;
    csv += `"The data in this profile are aggregated from small areas on a best-fit basis, and therefore may differ slightly from other sources."\n\n`;
    csv += `"Variable","Category","${getName("capitalise")}","England and Wales","Unit","Base population"\n`;

    tables.forEach((t) => {
      let meta = topicsLookup[t.code];
      let len = meta.categories.length;
      for (let i = 0; i < len; i++) {
        csv += `"${meta.label}","${meta.categories[i].label}",${
          t.data[i]
        },${t.data[len + i]},"${meta.unit}","${meta.base}"\n`;
      }
    });

    var file = new Blob([csv], {type: 'text/csv'});
    download(file, `${state.name ? state.name.replaceAll(' ', '_') : 'custom_area_data'}.csv`);
    analyticsEvent({event: "dataDownload", areaName: state.name});
  }
</script>

<ONSloader {isLoading} />
<nav>
  <div class="nav-left">
    <button
      class="text"
      on:click={() => goto(`${base}/draw/`)}
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
      <input type="text" bind:value={state.name} placeholder="Type your area name" />
      <button
        class="text"
        on:click={async () => {
          let blob = geo_blob(store);
          download(blob, `${state.name ? state.name.replaceAll(' ', '_') : 'custom_area'}.json`);
          state.showSave = false;
          analyticsEvent({event: "geoDownload", areaName: state.name});
        }}
      >
        <Icon type="download" /><span>Save geography</span>
      </button>
      <button
        class="text"
        on:click={() => {
          var codes = store.properties.oa_all.join(',');
          clip(codes, 'Copied output area codes to clipboard');
          state.showSave = false;
          analyticsEvent({event: "geoCopy", areaName: state.name});
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
    <input type="text" bind:value={state.name} placeholder="Type your area name" />

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
    {#each filterTopics(topics, state.topics, regex, state.topicsExpand) as topic, i (topic.code)}
    <div animate:flip={{duration: 500}} style:z-index={state.topics.includes(topic) ? 10 : 0}>
      <TopicItem {topic} {regex} show={state.topics.includes(topic) || i < 6 || state.topicsExpand}>
        <input
          type="checkbox"
          bind:group={state.topics}
          name="topics"
          value={topic}
        />
      </TopicItem>
    </div>
    {/each}
    {#if !regex}
      <button class="btn-link" style:margin="6px 0" on:click={() => (state.topicsExpand = !state.topicsExpand)}>
        {state.topicsExpand ? 'Show fewer' : `Show ${state.topics.length > 6 ? topics.length - state.topics.length : topics.length - 6} more`}
      </button>
    {/if}
  </aside>
  <article class="profile">
    <h2>Profile preview</h2>

    <div id="embed" />
    <Notice>
      The data and boundaries displayed in this profile are aggregated from small areas on a best-fit basis, and therefore may differ slightly from other sources.
    </Notice>
    <div class="embed-actions">
      <button class="btn-link" on:click={() => {
        pym_parent.sendMessage('makePNG', null);
        analyticsEvent({event: "imageDownload", areaName: state.name});
      }}>
        Save as image (PNG)
      </button> |
      <button class="btn-link"
        disabled={!state.topics}
        on:click={downloadData}>Download data (CSV)</button
      > |
      <button class="btn-link"
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
      {#if embed_hash && state.showEmbed}
        <p style:margin-bottom={0}>Embed code</p>
        <textarea rows="4" readonly>{makeEmbed(embed_hash)}</textarea>
        <button class="copy-embed"
          on:click={() => {
            clip(makeEmbed(embed_hash), 'Copied embed code to clipboard');
            analyticsEvent({event: "embed", areaName: state.name});
          }}>
          <Icon type="copy"/>
          <span>Copy embed code</span>
        </button>
      {/if}
    </div>
  </article>
</div>

<style>

  :global(#lmap) {
    filter: invert(0.9);
    opacity: 0.9;
  }
  .embed-actions {
    margin: 0 0 20px;
  }
  .embed-actions textarea {
    width: 100%;
    resize: none;
    color: #555;
    margin-bottom: 3px;
  }
  :global(.bx--inline-notification__subtitle) {
    margin: 1em;
  }
  :global(.bx--inline-notification__details svg) {
    visibility: hidden;
    width: 0;
    display: none;
  }
  input[type=checkbox] {
    margin-left: 1px;
  }
</style>
