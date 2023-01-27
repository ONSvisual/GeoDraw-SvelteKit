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

  let pym_child, name, comp, geojson, tables, population;
  let stats = [];

  let topicsLookup = (() => {
    let lookup = {};
    topics.forEach(t => lookup[t.code] = t);
    return lookup;
  })();

  function expandTable(table, areaName, compName) {
    let def = topicsLookup[table.code];
    let data = [];
    let i = 0;
    let names = table.data.length === def.categories.length ? [areaName] : [areaName, compName];
    names.forEach(name => {
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
        if (['name', 'comp'].includes(pair[0])) {
          props[pair[0]] = atob(pair[1]);
        } else if (['tabs', 'poly', 'population', 'stats'].includes(pair[0])) {
          props[pair[0]] = JSON.parse(atob(pair[1]));
        }
      }

      name = props.name ? props.name : "Selected area";
      comp = props.comp ? props.comp : "England and Wales";
      geojson = props.poly;
      population = props.population;
      tables = props.tabs;
      stats = props.stats;
    }
  }

  async function makePNG(e) {
    // console.log('pngbtn', e);

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
  });
</script>

<svelte:window on:hashchange={update} />
  
  
<svelte:head>
  <title>Custom area profile{name ? ` for ${name}` : ''}</title>
  <meta name="googlebot" content="noindex,indexifembedded" />
</svelte:head>

{#if tables}
  {#if name && name !== "Selected area"}
  <h1>{name}</h1>
  {/if}
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
          value={tab.data[0]}
          unit={topicsLookup[tab.code].unit}
          description={`<mark>${tab.data[1].toLocaleString('en-GB')}</mark> ${topicsLookup[tab.code].unit} in ${comp}`}
          rounded={tab.data[0] > 1000 ? `Rounded to the nearest 100 ${topicsLookup[tab.code].unit}` :
          tab.data[0] > 100 ? `Rounded to the nearest 10 ${topicsLookup[tab.code].unit} (nearest 100 for ${comp})` :
          null}
        />
        {:else if tab.code === "resident_age"}
        <ProfileChart xKey="category" yKey="value" zKey="areanm" data={expandTable(tab, name, comp)} base="% of {topicsLookup[tab.code].base}" />
        {:else}
        <BarChart xKey="value" yKey="category" zKey="areanm" data={expandTable(tab, name, comp)} base="% of {topicsLookup[tab.code].base}" />
        {/if}
      </Card>
    {/each}
  </Cards>

  <span class="footnote">Source: Office for National Statistics - Census 2021</span>
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
