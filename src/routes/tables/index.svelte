<script>
  import LibLoader from '$lib/LibLoader.svelte';
  // reducing svelte bundle size by using third party loaders for scripts...

  // import {page} from '$app/stores';
  import {onMount} from 'svelte';

  // import {assets} from '$app/paths';
  import Cards from '$lib/layout/Cards.svelte';
  import Card from '$lib/layout/partial/Card.svelte';
  // import MapStatic from '$lib/chart/MapStatic.svelte';
  // import BarChart from '$lib/chart/BarChart.svelte';
  // import ProfileChart from '$lib/chart/ProfileChart.svelte';
  //import * as dfd from '';//'danfojs';

  import BarChart from '$lib/tables/BarChart.svelte';
  import MapAreas from '$lib/tables/MapAreas.svelte';
  import {Button, ButtonSet, TextInput, Toggle} from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/white.css';

  // the string matching algorighm

  // console.log()

  // the table
  import {encode} from '$lib/binary.js';

  let url = '';

  let areaname = 'My Custom Area (Tables)';
  let includecodes = false;
  let includemap = true;
  let embed_data = {};

  let cache = {};
  let areas = '';
  var newdata = {tables: []};
  var coordinates = [];
  var compressed = [];

  const items = (object) =>
    Object.keys(object).map((key) => [key, object[key]]);

  function new_event(event) {
    // if (event.origin !== "http://ons.visual")
    //   return;
    var data = JSON.parse(event.data);

    // if we are using the same areas, we can cache the tables
    if (areas != data.areas) {
      areas = data.areas;
      coordinates = JSON.stringify(data.polygon);
      compressed = data.compressed;
      cache = {};
    }

    newdata = data;
  }

  async function get_data(data) {
    var tbls = data.tables.map(async function (table) {
      // console.log('---', table);

      if (table['Nomis table'] in cache) {
        return cache[table['Nomis table']];
      } else {
        return await dfd
          .readCSV(
            `https://www.nomisweb.co.uk/api/v01/dataset/${table[
              'Nomis table'
            ].toLowerCase()}.bulk.csv?date=latest&geography=MAKE|MyCustomArea|${areas},K04000001&rural_urban=0&measures=20100&select=geography_name,cell_name,obs_value`
          )
          // .then(d=>{console.log('ed',d.print(),d);return d})
          .then((d) => d.setIndex({column: 'geography'}))
          .then((de) => {
            var mappings = {};
            var cols = de.columns.filter((d) => d.includes(':'));
            cols.forEach((d, i) => {
              mappings[d] = d.replaceAll(/[\:\;]/g, ' ');
              ///:\s*(.+);/.exec(d)[1];
            });

            return de
              .loc({rows: de.index.filter((d) => d), columns: cols})
              .rename(mappings, {inplace: false});
          })

          
          .then((df_old) => {
            // mandatory cleanup
            var cols = df_old.$columns.filter(
              (d) =>
                !(
                  (
                    d.includes('count') ||
                    d.includes('All') ||
                    (d.match(/\;/g) || []).length === 1 ||
                    d.includes('sum') ||
                    d.includes('Total')
                  )
                  // d.includes('Mean')
                )
            );

            df_old = df_old.loc({columns: cols});


            // add headers to hash search algorithm
            const matches = table['Cell name'].map((d) => {
              var match = new Minhash();
              d.match(/\w+/g).forEach((e) => match.update(e));
              return [d, match];
            });

            // name cleanup
            let colmap = new Map();
            df_old.$columns.forEach((m) => {
              const m0 = new Minhash();
              m.match(/\w+/g).forEach((e) => m0.update(e));
              var last = 0;
              var keep = m;

              for (const mx of matches) {
                var j = m0.jaccard(mx[1]);
                if (j > last) {
                  last = j;
                  keep = mx[0];
                }
              }
              // create a hierarchical map
              colmap.set([keep, [m, ...(colmap.get(keep) || [])]]);
            });

            // rebuild with grouped data
            let df = {};
            colmap.forEach((_, item) => {
              var [key, value] = item;
              df[key] = df_old.loc({columns: value}).sum({axis: 1}).$data;
            });

            

            df = new dfd.DataFrame(df);


            df.print()

            console.log(df,df_old)

            var pc = df.div(df.sum(), {axis: 0});

            var lists = [];
            let keepcol = table['Cell name'].filter((d) =>
              df.$columns.includes(d)
            );
            // columns to plot (must appear in both nomis and datasheet. )
            dfd
              .toJSON(pc.loc({columns: keepcol}), {format: 'columns'})
              .forEach((dict, i) => {
                for (var key in dict) {
                  lists.push({
                    z: ['CustomArea', 'England and Wales'][i],
                    pc: dict[key],
                    column: key,
                  });
                }
              });

            cache[table['Nomis table']] = {
              name: table['Table name'],
              data: lists,
              embed: {
                nid: table['Nomis table'],
                did: keepcol.map((d) => table['Cell name'].indexOf(d)),
                data: [...new Uint16Array(lists.map((d) => d.pc * 10000))],
              },
            };
            console.error('talbe'), cache[table['Nomis table']]
            return cache[table['Nomis table']];
          });
      }
    });
    // console.error('444', await Promise.all(tbls));
    return Promise.all(tbls).then(async (tables) => {
      // update the embed cells with a new url
      embed_data = await tables.map((d) => d.embed);
      update_url()
      return tables;
    })
  }

  async function update_url() {
    // console.clear()
    if (!embed_data.length) return 0

    let c = includemap ? newdata.polygon.geometry.coordinates : false
    let s = includecodes ? newdata.compressed : false

    let edata = {
      data: embed_data,
      coordinates: c,
      compressed: s,
      name: areaname
    }
    console.log('encoded', edata);

    let hashstr = encode(edata);
    console.log(hashstr);

    // console.log(JSON.parse(coordinates))
    url = `${window.location.origin}/embed#${hashstr}`;
  }

  $: update_url(includemap,includecodes)

  //////////

  onMount(() => {
    window.addEventListener('message', new_event, false);
  });

  // $: console.log(newdata);
</script>

<LibLoader url="https://cdn.jsdelivr.net/npm/danfojs@1.1.0/lib/bundle.min.js" />
<LibLoader url="https://rawgit.com/duhaime/minhash/master/minhash.min.js" />

<svelte:head>
  <!-- <script src='' /> -->
</svelte:head>






  

  <div id='settings'>
<Cards>
    <Card title={'Embed Custom Profile'}>
    <br />
    {#if url}
      <code>
        Embedding URL length: <br />
        {url.length}
      </code>
      <br /><br />
      <TextInput
        labelText="Area Name"
        placeholder="Loading ..."
        bind:value={areaname}
        on:change={update_url}
      />
      <br />

      <!-- <span class = 'radio'>
        <Toggle
          bind:toggled={includecodes}
          size="sm"
        />Include Codes</span
      > -->

      <span class='radio'>
        <Toggle bind:toggled={includemap} size="sm" /> Include
        Map
      </span>

      <br />


    {/if}
    </Card>
    <Card title={'Selected Areas'}>
      This section outlines all the different areas codes which have been combined
      to produce the following report.
      <br /><br />
      {#each items(compressed) as item}
        <p style="display:inline"><b>{item[0].toUpperCase()} ({item[1].length})</b>:</p>
       <div class='code truncate' onclick={function(){console.log(this);this.classList.Toggle("truncate")}}>{item[1].join(', ')}</div>
        <br />
      {/each}
    </Card>
    
 
  <Card>
    <ButtonSet stacked id="bset">
      <Button kind="primary" on:click={window.parent.location.href = url}>Generate Embed Url</Button>

      <Button
        kind="secondary"
        on:click={() => {
          navigator.clipboard.writeText(url);
          // console.table(tables);
          console.log('data copied to clipboard');
        }}
      >
        Copy Selected Areas (for use in NOMIS or GIS)
      </Button>

      <Button kind="sucess">Download Data</Button>
    </ButtonSet>
  </Card>
</Cards>

    </div>


<br><br>
<h4>3. Preview:</h4>
<br>
{#await get_data(newdata) then tables}
<h1>{areaname}</h1>
<Cards>
  
  {#if includemap}
    <Card title={'Area map'}>
      <MapAreas minimap={coordinates} />
    </Card>
    {/if}
    
    {#if includecodes}

    {/if}

  

    {#each tables as tab}
      <Card title={tab.name}>
        <!-- <svelte:component this={charts[tab.meta.chart]} data={tab.data} suffix={tab.meta.unit} format={format(tab.meta.format)}/> -->
        <!-- {JSON.stringify(tab.data)} -->

        <BarChart xKey="pc" yKey="column" zKey="z" data={tab.data} />
      </Card>
    {/each}

  <br />
</Cards>  {/await}
<!-- <span class="footnote">Source: Census 2011 data. Office for National Statistics | <a href="{dataURL(tables)}" download="{name}.csv">Download the data</a> | <a href="{assets}" target="_blank">Build your own profile</a></span> -->

<!-- {/if} -->
<style>
  h1 {
    font-size: 1.8rem;
    margin: 0 0 -12px 0;
    font-weight: bold;
  }
  .footnote {
    margin-bottom: -20px;
  }

  .code{
    font-size: x-small;
    color:rgb(10, 33, 52);
    inline-size: 150px;
    overflow-wrap: break-word;
  }

  .code.truncate {
    width:100%;
    white-space: nowrap;
  overflow-x: scroll;
  text-overflow:scroll;
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none;
}

  b {
    font-weight: bold;
  }

  :global(#bset > *) {
    width: 100%;
    margin: 4px;
    
    float:right;
    padding: auto;
    margin-left: auto;
    margin-right: auto;
    display: inline-flex;
    position: flex;
  }

  :global(span.bx--toggle__switch) {
    display: block;
    margin: auto !important;
  }
  :global(span.radio) {
    display: block;
    vertical-align: middle;
    top: -0;
    float: end;
    margin: 0.05em;
    padding: 5px;
  }

  #settings{
    padding:20px;
    margin:auto!important;
    background-color: rgb(222, 221, 221);
    justify-content: space-around;
    border-radius: 10px;
  }
</style>
