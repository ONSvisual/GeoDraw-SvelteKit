<script>
  import '../../app.css';
  import { onMount, setContext } from "svelte";
  import { page } from '$app/stores';
  import { centroids } from './draw/mapstore.js';
  import { GetCentroids } from './draw/centroid_utils.js';
  import ONSHeader from '$lib/layout/ONSHeader.svelte';
  import Title from '$lib/layout/Title.svelte';

  let loaded = false;

  onMount(async () => {
    // calculate the centroids and simplifications.
    var centroid_dummy = await GetCentroids();
    centroids.set(centroid_dummy);
    loaded = true;
  });

  let path = $page.url.pathname;
  // console.warn('path', path);
</script>

<svelte:head>
  <title>Build a custom area profile - Census 2021, ONS</title>
  <meta property="og:title" content="Build a custom area profile - Census 2021, ONS" />
  <meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.ons.gov.uk/visualisations/customprofiles/draw/" />
	<meta property="og:image" content="https://www.ons.gov.uk/visualisations/customprofiles/img/og.png" />
	<meta property="og:image:type" content="image/png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:description" content="Create your own profile for local areas in England and Wales using Census 2021 data." />
	<meta name="description" content="Create your own profile for local areas in England and Wales using Census 2021 data. Data topics include population, age, sex, ethnicity, religion, the work people do, and the homes they live in." />

</svelte:head>

<main>
  <header>
    <ONSHeader />
    <Title />
  </header>

  {#if loaded}
  <slot  />
  {/if}
</main>

