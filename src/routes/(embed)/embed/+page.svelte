<script>
  import {onMount} from 'svelte';
  import pym from 'pym.js';
  import html2canvas from 'html2canvas';

  import Cards from '$lib/layout/Cards.svelte';
  import Card from '$lib/layout/partial/Card.svelte';
  import BarChart from '$lib/tables/BarChart.svelte';
  import MapAreas from '$lib/tables/MapAreas.svelte';
  import Vchart from '$lib/tables/Vchart.svelte'
  import {detach_after_dev} from 'svelte/internal';

  let pym_child;
  let name;
  let geojson;
  let tables;
  let population;

  function update() {
    let hash = window.location.hash;

    if (hash && hash.includes('name=')) {
      let props = {};
      let searchParams = new URLSearchParams(hash.slice(3));

      for (let pair of searchParams.entries()) {
        console.debug(pair);
        if (pair[0] == 'name') {
          props[pair[0]] = atob(pair[1]);
        } else if (['tabs', 'poly', 'population'].includes(pair[0])) {
          props[pair[0]] = JSON.parse(atob(pair[1]));
        }
      }

      name = props.name;
      geojson = props.poly;
      population = props.population;
      tables = props.tabs;

  //     if (population) {
  //       // var pdf = new dfd.DataFrame(population[1], {columns: population[0]})

  //       const pdf = new dfd.DataFrame({name: population[2],
  //         'England and Wales': population[3]}, {index: population[1]})

  //       // pdf.setIndex({column: 'C_AGE_NAME'})
  //       pdf.print()

  //       setTimeout(() => {

  //         var layout = {
  //           showlegend: false,
  // legend: {
  //   y: 1.4,
  //   // traceorder: 'reversed',
  //   font: {size: 16},
  //   // yref: 'paper',
  //   showlegend: false,
  // }};
  //       pdf.plot('population',layout).line(layout);
          
  //       }, 2000);
        

     
  //     } 
    }
  }

  async function makePNG(e) {
    console.log('pngbtn', e);

    let canvas = await html2canvas(document.body);
    const base64 = canvas.toDataURL();
    console.log(canvas);

    let a = document.createElement('a');
    a.href = base64;
    a.download = name.replace(/\s+/g, '_') + '.png';
    a.click();
  }

  onMount(() => {
    pym_child = new pym.Child({id: 'embed', polling: 1000});
    pym_child.onMessage('makePNG', makePNG);
    update();
    window.onhashchange = update;
  });
</script>

<svelte:head>
  <title>Custom area profile{name ? ` for ${name}` : ''}</title>
</svelte:head>

{#if tables}
  <h1>{name ? name : ''}</h1>
  <Cards>
    {#if geojson}
      <Card title="Area map">
        <div style:height="230px" style:width="100%">
          <MapAreas {geojson} />
        </div>
      </Card>
    {/if}

    {#if population}
      <Card title="Population">
        <Vchart bind:population name={[name,'England and Wales']}/>
        <!-- <div id='population' style:height="100%" style:width="100%" /> -->
      </Card>
    {/if}

    {#each tables as tab}
      <Card title={tab.name}>
        <BarChart xKey="pc" yKey="column" zKey="z" data={tab.data} />
      </Card>
    {/each}
  </Cards>

  <span class="footnote"
    >Source: Census 2011 data. Office for National Statistics | <a
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
</style>
