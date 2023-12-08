<script>
  import {onMount} from 'svelte';
  import pym from 'pym.js';
  import html2canvas from 'html2canvas';
  import topics from '$lib/config/topics.json';
  import Cards from '$lib/layout/Cards.svelte';
  import Card from '$lib/layout/partial/Card.svelte';
  import BarChart from '$lib/charts/BarChart.svelte';
  import AreaMap from '$lib/charts/AreaMap.svelte';
  import ProfileChart from '$lib/charts/ProfileChart.svelte';
  import LineChart from '$lib/charts/LineChart.svelte';
  import BigNumber from '$lib/charts/BigNumber.svelte';

  let pym_child, name, comp, geojson, comp_geojson, tables, population;
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
    for (const name of names) {
      for (const cat of def.categories) {
        data.push({areanm: name, category: cat.label, value: table.data[i]})
        i ++;
      }
    }
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
        } else if (['tabs', 'poly', 'comppoly', 'population', 'stats'].includes(pair[0])) {
          props[pair[0]] = JSON.parse(atob(pair[1]));
        }
      }

      name = props.name || "Selected area";
      comp = props.comp || "";
      geojson = props.poly;
      comp_geojson = props.comppoly;
      population = props.population;
      tables = props.tabs.map(t => ({
        ...topicsLookup[t.code],
        data: expandTable(t, name, comp)
      }));
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
  <title>Area profile{name ? ` for ${name}` : ''}</title>
  <meta name="googlebot" content="noindex,indexifembedded" />
</svelte:head>

{#if tables}
  {#if name && name !== "Selected area"}
  <h1>{name}</h1>
  {/if}
  <Cards>
    {#if geojson}
      <Card title="Area map">
        <AreaMap {name} {comp} {geojson} {comp_geojson} />
      </Card>
    {/if}
    {#each tables || [] as tab (tab.code)}
      <Card title="{tab.label} <span>{tab.date ? tab.date : '2021'}</span>">
        {#if tab?.chart === "number"}
        <BigNumber
          value={tab.data[0].value}
          unit={tab.unit}
          prefix={tab.prefix}
          description={comp ? `<mark>${tab.prefix || ""}${tab.data[1].value.toLocaleString('en-GB')}</mark> ${tab.unit} in ${comp}` : ''}
          rounded={tab.data[0].value > 1000 ? `Rounded to the nearest 100 ${tab.unit}` :
          tab.data[0].value > 100 ? `Rounded to the nearest 10 ${tab.unit}` :
          null}
        />
        {:else if tab?.chart === "profile"}
        <ProfileChart xKey="category" yKey="value" zKey="areanm" data={tab.data} base="% of {tab.base}" />
        {:else if tab?.chart === "line"}
        <LineChart data={tab.data} zKey="areanm" xDomain={tab.categories.map(c => c.label)} base="% change since {tab.categories[0].label}" />
        {:else}
        <BarChart xKey="value" yKey="category" zKey="areanm" data={tab.data} base="% of {tab.base}" />
        {/if}
      </Card>
    {/each}
  </Cards>

  <span class="footnote">Source: Office for National Statistics - Census 2021</span>
  <div class="spacer"/>
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
  div.spacer {
    height: 10px;
  }
</style>
