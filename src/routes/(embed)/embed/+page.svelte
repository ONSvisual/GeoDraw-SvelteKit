<script>
  import {onMount} from 'svelte';
  import pym from 'pym.js';
  import html2canvas from 'html2canvas';
  import topics from '$lib/topics.json';
  import Cards from '$lib/layout/Cards.svelte';
  import Card from '$lib/layout/partial/Card.svelte';
  import BarChart from '$lib/tables/BarChart.svelte';
  import MapAreas from '$lib/tables/MapAreas.svelte';
  import ProfileChart from '$lib/tables/ProfileChart.svelte';
  import BigNumber from '$lib/tables/cards/BigNumber.svelte';

  let pym_child, name,geojson,tables,population,stats = [];

  let topicsLookup = (() => {
    let lookup = {};
    topics.forEach(t => lookup[t.code] = t);
    return lookup;
  })();

  function expandTable(table, areaName) {
    let def = topicsLookup[table.code];
    let data = [];
    let i = 0;
    [areaName, "England and Wales"].forEach(name => {
      def.categories.forEach(cat => {
        data.push({areanm: name, category: cat.label, value: table.data[i]})
        i ++;
      });
    });
    return data;
  };

  function update() {
    
    let hash = document.location.hash;

    if (hash && hash.includes('name=')) {
      let props = {};
      let searchParams = new URLSearchParams(hash.slice(3));

      for (let pair of searchParams.entries()) {
        if (pair[0] == 'name') {
          props[pair[0]] = atob(pair[1]);
        } else if (['tabs', 'poly', 'population', 'stats'].includes(pair[0])) {
          props[pair[0]] = JSON.parse(atob(pair[1]));
        }
      }

      name = props.name;
      geojson = props.poly;
      population = props.population;
      tables = props.tabs;
      stats = props.stats;
    }
  }

  async function makePNG(e) {
    console.log('pngbtn', e);

    let canvas = await html2canvas(document.body);
    const base64 = canvas.toDataURL();
    let a = document.createElement('a');
    a.href = base64;
    a.download = name.replace(/\s+/g, '_') + '.png';
    a.click();
  }

  onMount(() => {
    pym_child = new pym.Child({id: 'embed', polling: 1000});
    pym_child.onMessage('makePNG', makePNG);
    update();
//     window.onhashchange = update; 
//     document.addEventListener('hashchange',update)
  });
</script>

<svelte:window on:hashchange={update}>
  
  
<svelte:head>
  <title>Custom area profile{name ? ` for ${name}` : ''}</title>
</svelte:head>

{#if tables}
  <h1>{name ? name : ''}</h1>
  <Cards>
    {#if geojson}
      <Card title="Area map">
        <div style:min-height="260px" style:width="100%">
          <MapAreas {geojson} />
        </div>
      </Card>
    {/if}
    {#each tables || [] as tab}
      <Card title={topicsLookup[tab.code].label}>
        {#if ["population", "households", "population_density", "median_age"].includes(tab.code)}
        <BigNumber
          value={tab.data[0].toLocaleString()}
          unit={topicsLookup[tab.code].unit}
          description={`<mark>${tab.data[1].toLocaleString()}</mark>  in England and Wales`}
        />
        {:else if tab.code === "resident_age"}
        <ProfileChart xKey="category" yKey="value" zKey="areanm" data={expandTable(tab, name)} />
        {:else}
        <BarChart xKey="value" yKey="category" zKey="areanm" data={expandTable(tab, name)} />
        {/if}
      </Card>
    {/each}
  </Cards>

  <span class="footnote"
    >Source: Census 2021 data. Office for National Statistics | <a
      href="/"
      target="_blank">Build a custom area profile</a
    ></span
  >
{/if}

<style>
  h1 {
    font-size: 1.8rem;
    margin: 0 0 -12px 0;
    font-weight: bold;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: bold;
  }
</style>
