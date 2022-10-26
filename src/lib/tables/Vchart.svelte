<script>
  export let population = [[], [], []];
  export let name;
  import ProfileChart from '$lib/tables/cards/ProfileChart.svelte';

  function first(b) {
    return b.split('_')[0];
  }

  function range(b) {
    var ends = b.split('_');
    return +ends[1] - +ends[0] || 4;
  }

  function lat(b) {
    return +b.split('_')[1];
  }

  function mid(b) {
    var ends = b.split('_');
    return (+ends[1] + +ends[0]) / 2 || 90;
  }

  function sum(x) {
    return x.reduce((a, b) => a + b);
  }

  function median(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  function histomean(x, freq) {
    var middle = x.filter((d) => d).map(mid);
    var total = sum(freq);

    return sum(middle.map((d, i) => d * freq[i])) / total;
  }

  function sveltecard() {
    var slen = population[0].length;
    return [...population[1], ...population[1]].map((d, i) => {
      var j = i >= slen;
      if (j) {
        i -= slen;
      }

      return {x: d, category: name[0+j], y: population[j + 2][i]};
    }).filter(d=>d.x)
  }

  console.warn(population, sveltecard(), name);
</script>

<!-- {#if name}
  <ul class="legend-block">
    {#each name as group, i}
      <li class:ew={i != 0}>
        <div
          class="legend-vis {i == 0 ? 'bar' : 'marker'}"
          style:height="1rem"
          style:width={i == 0 ? '1rem' : 3 + 'px'}
        />
        <span class={i == 0 ? 'bold' : 'brackets'}>{group}</span>
      </li>
    {/each}
  </ul>
{/if}

<svg viewBox="5 -20 85 130">
  {#each population[1] as band, i}
    {#if band}
      <rect
        x={first(band)}
        y={100 - population[2][i] / 100}
        rx=".1"
        width={0.5 + range(band)}
        height={population[2][i] / 100}
        style="fill:#27A0CC;"
      />

      <rect
        x={first(band)}
        y={100 - population[3][i] / 100}
        rx=".1"
        width={0.5 + range(band)}
        height={1}
        style="fill:#272727;"
      />
      {#if i % 4 === 0}
        <text x={+first(band) - 1} y="105">{first(band)}</text>
      {/if}
    {/if}
  {/each}
</svg>

<h3 style="font-size:.9rem;font-weight:bold">
  Population ({name[0]}):
  <span style="font-size:0.85rem;font-weight:300"
    >{sum(population[0])} people</span
  >
</h3>

<h3 style="font-size:.9rem;font-weight:bold">
  Mean Age ({name[0]}):
  <span style="font-size:0.85rem;font-weight:300"
    >{histomean(population[1], population[0]).toFixed(2)} years</span
  >
</h3> -->
<!-- <h3>Age Profile</h3> -->
<ProfileChart data={sveltecard()} xKey="x" yKey="y" zKey="category" />

<style>
  text {
    font-size: 5px;
  }
  rect {
    opacity: 0.9;
  }
  svg {
    /* width:400px;
    height:400px; */
    /* height:50%; */
    max-height: 400px;
    min-width: 100%;
  }

  .label-group {
    margin: 4px 0 1px 0;
    padding: 0;
    line-height: 1.2;
    font-size: 0.9rem;
  }
  .bold {
    font-weight: bold;
    color: #023d52;
  }
  .sml {
    margin-left: 3px;
    font-size: 0.85rem;
  }
  .ew {
    /* color:red; */
    float: right !important;
  }
  .brakets {
    color: #272727;
  }

  .legend-vis {
    display: inline-block;
    transform: translate(0, 3px);
  }

  ul.legend-block {
    list-style-type: none;
    padding: 0;
    margin: 0 0 5px 0;
  }
  ul.legend-block > li {
    display: inline-block;
    margin: 0 10px 0 0;
    padding: 0;
  }

  .bar {
    background-color: #27a0cc;
  }
  .marker {
    border-left-color: black;
    border-left-style: solid;
  }
</style>
