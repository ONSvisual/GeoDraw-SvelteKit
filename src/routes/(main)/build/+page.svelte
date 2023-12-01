<script>
  import ONSloader from '$lib/ui/ONSloader.svelte';
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';
	import {flip} from 'svelte/animate';
  import pym from 'pym.js';
  import tooltip from '$lib/ui/tooltip';
  import Notice from '$lib/ui/Notice.svelte';
  import TopicItem from '$lib/ui/TopicItem.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import Select from '$lib/ui/Select.svelte';
  import topics_all from '$lib/config/topics.json';
  import {simplify_geo, geo_blob} from '../draw/drawing-utils';
  import getTable from './gettable';
  import getParents from './getparents';
  import {cdnbase} from '$lib/config/geography';
  import {download, clip} from '$lib/util/functions';
  import {onMount} from 'svelte';
  import {centroids} from '$lib/stores/mapstore';
  import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';
  let isLoading = false;
  let pym_parent; // Variabl for pym
  let embed_hash; // Variable for embed hash string
  let tables = []; // Array to hold table data
  let includemap = true;
  let includecomp = false;
  let parents;
  let coverage = ["E", "W"];
  let topics = [...topics_all]; // Topics might be filtered based on coverage

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
    comparison: null
  };

  function filterTopics(topics, selected, regex) {
    /// display only those which exist
    let topics_start = [];
    let topics_end = [];
    [...topics]
      .filter(t => !t.coverage || t.coverage.every(c => coverage.includes(c)))
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

  async function getAreaData(code, options = {}) {
    const res = await fetch(
      `${cdnbase}/${code.slice(0, 3)}/${code}.json`
    );
    const data = await res.json();
    const compressed = data.properties.c21cds;
    return {
      geojson: data,
      properties: {
        oa_all: !options?.comparison ? $centroids.expand(compressed) : null,
        compressed,
        name: data.properties.hclnm
          ? data.properties.hclnm
          : data.properties.areanm
          ? data.properties.areanm
          : code
      },
    };
  }

  async function init() {
    isLoading = true;

    // in case we call for a pre loaded area as a hash string
    let hash = window.location.hash;
    if (hash.match(/#[EW]\d{8}/)) {
      let code = hash.slice(1);
      try {
        const info = await getAreaData(code);
        localStorage.setItem('onsbuild', JSON.stringify(info));
        analyticsEvent({
          event: "hashSelect",
          areaCode: code,
          areaName: info.properties.name
        });
      } catch (err) {
        console.warn(`Requested GSS code ${code} is unavailable or invalid.`);
        history.replaceState(null, '', ' ');
      }
    }

    // resume as normal
    store = JSON.parse(localStorage.getItem('onsbuild'));

    // console.debug('build-', store);
    if (!store) {
      alert('Warning, no area selected! Redirecting to the drawing page.');
      goto(`${base}/draw/`);
    }

    geojson = simplify_geo(store.geojson.geometry);

    let props = store.properties;
    // console.log('props', props);

    state.name = props.name;
    state.codes = props.oa_all;
    state.compressed = props.compressed;
    
    let par = await getParents(geojson, state.compressed);
    coverage = par.coverage;
    parents = par.parents.filter(p => p.areanm !== state.name);
    topics = topics_all.filter(t => !t.coverage || coverage.every(c => t.coverage.includes(c)));
    state.comparison = coverage[1] ? parents[0] : parents[1];

    state.start = true;
    // console.warn(state.compressed);
  }

  onMount(init);

  ////////////////////////////////////////////////////////////////
  // Processing functions
  ////////////////////////////////////////////////////////////////
  let cache = {};
  async function get_data(data, comp) {
    if (!state.start) return [];
    if (!cache[comp]) cache[comp] = {};
    let tables = [];
    for (let i = 0; i < data.length; i++) {
      let table;
      if (cache[comp][data[i].code]) {
        table = cache[comp][data[i].code];
      } else {
        table = await getTable(data[i], state, comp);
        cache[comp][data[i].code] = table;
      }
      tables.push({code: data[i].code, data: table});
    }
    // console.log("tables", tables);
    return tables;
  }

  async function update_profile(start, name, comp, data, includemap, includecomp) {
    if (start) {
      var ls = JSON.parse(localStorage.getItem('onsbuild'));
      ls.properties.name = name;
      localStorage.setItem('onsbuild', JSON.stringify(ls));

      let codes = data.map((d) => d.code);
      let compcds = comp?.codes ? comp.codes.join(";") : comp?.areacd || '';
      tables = await get_data(topics.filter((t) => codes.includes(t.code)), compcds);

      embed_hash = `#/?name=${btoa(name)}${
        comp ? `&comp=${btoa(comp.areanm)}` : ''
      }&tabs=${btoa(JSON.stringify(tables))}${
        includemap ? `&poly=${btoa(JSON.stringify(geojson))}` : ''
      }${
        includemap && includecomp && comp?.geometry ? `&comppoly=${btoa(JSON.stringify(simplify_geo(comp.geometry)))}` : ''
      }`;

      // alert(population)

      if (!pym_parent) {
        pym_parent = new pym.Parent('embed', `${base}/embed/${embed_hash}`, {
          name: 'embed',
          id: 'iframe',
          title: 'Embedded area profile'
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

  $: update_profile(state.start, state.name, state.comparison, state.topics, includemap, includecomp);

  function makeEmbed(embed_hash) {
    let url = `https://www.ons.gov.uk/visualisations/customprofiles/embed/${embed_hash}`;
    return `<div id="custom-profile"></div>
<script src="https://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"><\/script>
<script>var pymParent = new pym.Parent("custom-profile", "${url}", {name: "custom-profile", title: "Embedded area profile"});<\/script>`;
  }

  async function downloadData() {
    let csv = `"Custom area profile data for ${getName()}"\n`;
    csv += `"Source: Office for National Statistics - Census 2021"\n\n`;
    csv += `"Data generated by the Build a custom area profile tool on ${new Date().toLocaleDateString(
      'en-GB',
      {year: 'numeric', month: 'short', day: 'numeric'}
    )}"\n`;
    csv += `"The data in this profile are aggregated from small areas on a best-fit basis, and therefore may differ slightly from other sources."\n\n`;
    csv += `"Variable","Category","${getName("capitalise")}","${state.comparison.areanm}","Unit","Base population"\n`;

    tables.forEach((t) => {
      let meta = topicsLookup[t.code];
      let len = meta.categories.length;
      for (let i = 0; i < len; i++) {
        csv += `"${meta.label}","${meta.categories[i].label}",${
          t.data[i] ? t.data[i] : "NA"
        },${
          t.data[len + i] ? t.data[len + i] : "NA"
        },"${meta.unit}","${meta.base}"\n`;
      }
    });

    var file = new Blob([csv], {type: 'text/csv'});
    download(file, `${state.name ? state.name.replaceAll(' ', '_') : 'custom_area_data'}.csv`);
    let opts = state.name ? {areaName: state.name} : {};
    analyticsEvent({event: "fileDownload", fileExtension: "csv", ...opts});
  }

  $: console.log(state.comparison)
</script>

<ONSloader {isLoading} />
<nav>
  <div class="nav-left">
    <button
      class="text"
      on:click={() => goto(`${base}/draw/`)}
    >
      <Icon type="chevron" rotation={180} /><span>Edit custom area</span>
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
          download(blob, `${state.name ? state.name.replaceAll(' ', '_') : 'custom_area'}.geojson`);
          state.showSave = false;
          let opts = state.name ? {areaName: state.name} : {};
          analyticsEvent({event: "fileDownload", fileExtension: "json", ...opts});
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
          let opts = state.name ? {areaName: state.name} : {};
          analyticsEvent({event: "geoCopy", ...opts});
        }}
      >
        <Icon type="copy" /><span>Copy area codes</span>
      </button>
    </div>
  </nav>
{/if}
<div class="container">
  <aside class="topics-box">
    <h2>Name your custom area</h2>
    <input type="text" bind:value={state.name} placeholder="Type your area name" />

    <label>
      <input type="checkbox" bind:checked={includemap} />
      Include map
    </label>
    
    {#if parents}
    <h2>Select comparison area</h2>
    <!-- <select bind:value={state.comparison}>
      {#each parents as parent}
      <option value={parent}>{parent.areanm}</option>
      {/each}
    </select> -->
    <Select value={state.comparison} autoClear={false} isClearable on:select={(e) => state.comparison = e.detail} on:clear={() => state.comparison = null}/>

    {#if includemap && state?.comparison?.geometry}
    <label>
      <input type="checkbox" bind:checked={includecomp} />
      Show on map
    </label>
    {/if}
    {/if}

    <h2>Select topics</h2>
    <input
      type="text"
      placeholder="Type to filter"
      bind:value={state.topicsFilter}
    />
    {#each filterTopics(topics, state.topics, regex, state.topicsExpand) as topic, i (topic.code)}
    <div animate:flip={{duration: 500}} style:z-index={state.topics.includes(topic) ? 10 : 0}>
      <TopicItem {topic} {regex} show={state.topics.includes(topic) || i < 6 || state.topicsExpand} selected={state.topics.includes(topic)}>
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

    <div class="related-content">
      <p><strong>Looking for another topic?</strong></p>
      <p>
        Due to technical constraints, not all Census 2021 topics can be included in this tool.
      </p>
      <p>
        
        Data for a wider range of topics can be found on <a href="https://www.nomisweb.co.uk/sources/census_2021" target="_blank" rel="noreferrer">Nomis</a>
        <span style:font-size="0.8em" style:margin="0 2px"><Icon type="launch" /></span>.
        Multi-variate data can be found via the <a href="https://www.ons.gov.uk/datasets/create" target="_blank">Create a custom dataset</a> service.
      </p>
    </div>
  </aside>
  <article class="profile">
    <h2>Profile preview</h2>

    <div id="embed" />
    <Notice>
      The data and boundaries displayed in this profile are aggregated from small areas on a best-fit basis, and therefore may differ slightly from other sources.
    </Notice>
    <div class="embed-actions">
      <button class="btn-link"
        disabled={!state.topics}
        on:click={() => document.getElementById('iframe').contentWindow.print()}>
        Print profile
      </button> |
      <button class="btn-link" on:click={() => {
        pym_parent.sendMessage('makePNG', null);
        let opts = state.name ? {areaName: state.name} : {};
        analyticsEvent({event: "fileDownload", fileExtension: "png", ...opts});
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
            let opts = state.name ? {areaName: state.name} : {};
            analyticsEvent({event: "embed", ...opts});
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
