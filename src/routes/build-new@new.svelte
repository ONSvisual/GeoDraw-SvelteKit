<svelte:head>
	<!-- <script	src="https://cdn.jsdelivr.net/npm/danfojs@1.1.0/lib/bundle.min.js"></script> -->
	<!-- <LibLoader
		url="https://cdn.jsdelivr.net/npm/danfojs@1.1.0/lib/bundle.min.js"
	/>-->
	<LibLoader url="https://rawgit.com/duhaime/minhash/master/minhash.min.js" /> 
</svelte:head>

<script>
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import tooltip from "$lib/ui/tooltip";
	import Icon from "$lib/ui/Icon.svelte";
	import LibLoader from "$lib/LibLoader.svelte";

	import Cards from "$lib/layout/Cards.svelte";
	import Card from "$lib/layout/partial/Card.svelte";

	import BarChart from "$lib/tables/BarChart.svelte";
	import MapAreas from "$lib/tables/MapAreas.svelte";

	import { default as datasets } from "$lib/util/custom_profiles_tables.json";
	import { onMount } from "svelte";
	let dataset_keys = Object.keys(datasets);
	dataset_keys = dataset_keys.filter(
		(key) => !/UK\]| - | by |\[[^K]|WA\]/.test(datasets[key].name)
	); // strip non k tables, welsh only, and bivariate tables
	let name2key = Object.fromEntries(
		new Map(dataset_keys.map((d) => [datasets[d]["Table name"], d]))
	);

	import * as dfd from 'danfojs'

	const topics = [
		{ key: "population", label: "Population" },
		{ key: "density", label: "Population density" },
		{ key: "agemed", label: "Average (median) age" },
		{ key: "age", label: "Age profile" },
		{ key: "sex", label: "Sex" },
		{ key: "ethnicity", label: "Ethnicity" },
		{ key: "religion", label: "Religion" },
		{ key: "marital", label: "Marital status" },
		{ key: "qualification", label: "Highest qualification" },
		{ key: "grade", label: "Social grade" },
		{ key: "economic", label: "Economic activity" },
		{ key: "travel", label: "Travel to work" },
		{ key: "hours", label: "Hours worked" },
		{ key: "housing", label: "Housing type" },
		{ key: "tenure", label: "Housing tenure" },
		{ key: "bedrooms", label: "Number of bedrooms" },
		{ key: "occupancy", label: "Persons per bedroom" },
	]
		.map(function (topic) {
			return Object.assign({}, topic, datasets[name2key[topic.label]]);
		})
		.filter((d) => d["Nomis table"]);

	let state = {
		mode: "move",
		radius: 5,
		select: "add",
		name: "Unnamed Custom Area",
		showSave: false,
		topics: [topics[0]],
		topicsExpand: false,
		topicsFilter: "",
	};

	function filterTopics(topics, selected, regex, expand) {
		let topics_start = [];
		let topics_end = [];
		topics.forEach((topic) => {
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
		return regex ? str.replace(regex, "<mark>$&</mark>") : str;
	}

	$: regex =
		state.topicsFilter.length > 1
			? new RegExp(state.topicsFilter, "i")
			: null;

	// function statechange(states) {
	// 	console.log(states);

	// 	// var tlist = states.map((key) => datasets[key]); //get obj
	// 	// var alist = Object.values(compressed).flat().join(";"); // flatten dict
	// }


	let store;
	async function init() {
		store = JSON.parse(localStorage.getItem("onsbuild"));
		console.warn("build", store);
		// dfd = (await import('https://cdn.jsdelivr.net/npm/danfojs@1.1.0/lib/bundle.min.js')).default
		console.log(store)
		state.start=true

		let props = store.properties
		state.compressed = Object.values({...props.msoa,...props.lsoa,...props.msoa,...props.oa}).flat().join(';');

		// var senddata = {
		// 	tables: tlist,
		// 	areas: alist,
		// 	compressed,
		// 	polygon: polygon,
		// };
	}

	onMount(init);
	// $: get_data(state.topics);

	////////////////////////////////////////////////////////////////
	// Processing functions
	////////////////////////////////////////////////////////////////
	let cache = {};
	async function get_data(data) {
		console.log(state)
		if (!state.start) return []
		let rtn = data.map(async function (table) {
			// console.log('---', table);

			if (table["Nomis table"] in cache) {
				return cache[table["Nomis table"]];
			} else {
				return await dfd
					.readCSV(
						`https://www.nomisweb.co.uk/api/v01/dataset/${table[
							"Nomis table"
						].toLowerCase()}.bulk.csv?date=latest&geography=MAKE|MyCustomArea|${state.compressed},K04000001&rural_urban=0&measures=20100&select=geography_name,cell_name,obs_value`
					)
					// .then(d=>{console.log('ed',d.print(),d);return d})
					.then((d) => d.setIndex({ column: "geography" }))
					.then((de) => {
						var mappings = {};
						var cols = de.columns.filter((d) => d.includes(":"));
						cols.forEach((d, i) => {
							mappings[d] = d.replaceAll(/[\:\;]/g, " ");
							///:\s*(.+);/.exec(d)[1];
						});

						return de
							.loc({
								rows: de.index.filter((d) => d),
								columns: cols,
							})
							.rename(mappings, { inplace: false });
					})

					.then((df_old) => {
						// mandatory cleanup
						var cols = df_old.$columns.filter(
							(d) =>
								!(
									(
										d.includes("count") ||
										d.includes("All") ||
										(d.match(/\;/g) || []).length === 1 ||
										d.includes("sum") ||
										d.includes("Total")
									)
									// d.includes('Mean')
								)
						);

						df_old = df_old.loc({ columns: cols });

						// add headers to hash search algorithm
						const matches = table["Cell name"].map((d) => {
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
							colmap.set([
								keep,
								[m, ...(colmap.get(keep) || [])],
							]);
						});

						// rebuild with grouped data
						let df = {};
						colmap.forEach((_, item) => {
							var [key, value] = item;
							df[key] = df_old
								.loc({ columns: value })
								.sum({ axis: 1 }).$data;
						});

						df = new dfd.DataFrame(df);

						df.print();

						console.log(df, df_old);

						var pc = df.div(df.sum(), { axis: 0 });

						var lists = [];
						let keepcol = table["Cell name"].filter((d) =>
							df.$columns.includes(d)
						);
						// columns to plot (must appear in both nomis and datasheet. )
						dfd.toJSON(pc.loc({ columns: keepcol }), {
							format: "columns",
						}).forEach((dict, i) => {
							for (var key in dict) {
								lists.push({
									z: ["CustomArea", "England and Wales"][i],
									pc: dict[key],
									column: key,
								});
							}
						});

						cache[table["Nomis table"]] = {
							name: table["Table name"],
							data: lists,
							embed: {
								nid: table["Nomis table"],
								did: keepcol.map((d) =>
									table["Cell name"].indexOf(d)
								),
								data: [
									...new Uint16Array(
										lists.map((d) => d.pc * 10000)
									),
								],
							},
						};
						console.error("talbe"), cache[table["Nomis table"]];
						return cache[table["Nomis table"]];
					});
			}
		});
		console.log(rtn);
		return rtn;
	}
</script>


<nav>
	<div class="nav-left">
		<button class="text" on:click={() => goto(`${base}/draw-new`)}>
			<Icon type="chevron" rotation={180} /><span>Edit area</span>
		</button>
	</div>
	<div class="nav-right">
		<button
			title={state.showSave ? "Close save options" : "Save selected area"}
			use:tooltip
			on:click={() => (state.showSave = !state.showSave)}
			class:active={state.showSave}
		>
			<Icon
				type={state.showSave ? "add" : "download"}
				rotation={state.showSave ? 45 : 0}
			/>
		</button>
	</div>
</nav>
{#if state.showSave}
	<nav class="tray">
		<div />
		<div class="save-buttons">
			<input
				type="text"
				bind:value={state.name}
				placeholder="Type a name"
			/>
			<button class="text">
				<Icon type="download" /><span>Save area codes</span>
			</button>
			<button class="text">
				<Icon type="download" /><span>Save boundary</span>
			</button>
		</div>
	</nav>
{/if}
<div class="container">
	<aside class="topics-box">
		<h2>Name your area</h2>
		<input type="text" bind:value={state.name} placeholder="Type a name" />
		<h2>Select topics</h2>
		<input
			type="text"
			placeholder="Type to filter"
			bind:value={state.topicsFilter}
		/>
		{#each filterTopics(topics, state.topics, regex, state.topicsExpand) as topic, i}
			<label style:display={i < 6 || state.topicsExpand ? null : "none"}>
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
				{state.topicsExpand
					? "Show fewer"
					: `Show ${topics.length - 6} more`}
			</button>
		{/if}
	</aside>
	<article class="profile">
		<h2>Profile preview</h2>
		<div class="embed">
			<h3>{state.name}</h3>

			{#await get_data(state.topics) then tables}
				<Cards>
					<!-- {#if includemap}
    <Card title={'Area map'}>
      <MapAreas minimap={coordinates} />
    </Card>
    {/if} -->

					{#each tables as tab}
						<Card title={tab.name}>
							<!-- <svelte:component this={charts[tab.meta.chart]} data={tab.data} suffix={tab.meta.unit} format={format(tab.meta.format)}/> -->
							<!-- {JSON.stringify(tab.data)} -->
<!-- 
							<BarChart
								xKey="pc"
								yKey="column"
								zKey="z"
								data={tab.data}
							/> -->
						</Card>
					{/each}

					<br />
				</Cards>
			{/await}
		</div>
		<div class="embed-actions">
			<button>Show Embed code</button>
			<button>Download PNG</button>
			<button>Download Data</button>
		</div>
	</article>
</div>

<style>
	.profile {
		flex-grow: 1;
	}
	.embed {
		display: block;
		width: 100%;
		height: 400px;
		margin-bottom: 10px;
		background-color: lightgrey;
	}
</style>
