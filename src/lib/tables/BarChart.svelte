<script>
	export let data;
	export let xKey = "value";
	export let yKey = "category";
	export let zKey = "areanm";

	// if less than 1% use decimal formatting
	export let formatTick = num => num.toFixed(1);
	export let suffix = "%";
  export let base = null;
	export let barHeight = 25;
	export let markerWidth = 3;
	
	function groupData(data, key) {
		let data_indexed = {};
    let keys = [];
		for (const d of data) {
			if (!data_indexed[d[key]]) {
				data_indexed[d[key]] = {
					label: d[key],
					values: []
				};
        keys.push(d[key]);
			}
			data_indexed[d[key]].values.push(d);
		}
		
		let data_grouped = [];
		keys.forEach(key => {
			data_grouped.push(data_indexed[key]);
		});
    
		return data_grouped;
	}
	

	$: xMax = Math.max(...data.map(d => d[xKey]));
	$: zDomain = data.map(d => d[zKey]).filter((v, i, a) => a.indexOf(v) === i);
	
	$: xScale = (value) => (value / xMax) * 100;
	$: data_grouped = groupData(data, yKey);
</script>

{#if zDomain[1]}
<ul class="legend-block">
	{#each zDomain as group, i}
	<li class:ew={i != 0}>
		<div class="legend-vis {i == 0 ? 'bar' : 'marker'}" style:height="1rem" style:width="{i == 0 ? '1rem' : markerWidth + 'px'}"></div>
		<span class="{i == 0 ? 'bold' : 'brackets'}">{group}</span>
	</li>
	{/each}
</ul>
{/if}

{#each data_grouped as group}
	<div class="label-group">
		{group.label}
    <span class="nowrap">
      {#each group.values as d, i}
      <span class="label {i == 0 ? 'bold' : 'sml brackets'}">{formatTick(d[xKey])}{suffix}</span>
      {/each}
    </span>
	</div>
	<div class="bar-group" style:height="{barHeight}px">
	{#each group.values as d, i}
		{#if i == 0}
		<div class="bar" style:left="0" style:width="{xScale(d[xKey])}%"/>
		{:else}
		<div class="marker" style:left="calc({xScale(d[xKey])}% - {markerWidth / 2}px)" style:border-left-width="{markerWidth}px"/>
		{/if}
	{/each}
	</div>
{/each}
{#if base}
<small>{base}</small>
{/if}

<style>
	.label-group {
		margin: 4px 0 1px 0;
    padding: 0;
    line-height: 1.2;
		font-size: 0.9rem;
	}
	.bold {
		font-weight: bold;
	}
	.sml {
		margin-left: 3px;
		font-size: .85rem;
	}
	.brackets::before {
		content: "(";
		
	}
	.brackets::after {
		content: ")";
	}
	.bar-group {
		display: block;
		position: relative;
		width: 100%;
	}
	.bar-group > div {
		position: absolute;
		height: 100%;
		top: 0;
	}
	.bar {
		background-color: #27A0CC;
	}
	.marker {
		border-left-color: black;
		border-left-style: solid;
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
	.legend-vis {
		display: inline-block;
		transform: translate(0,3px);
	}
  small {
    display: block;
    margin-top: 6px;
    color: #777;
  }
  .nowrap {
    white-space: nowrap;
  }
</style>
