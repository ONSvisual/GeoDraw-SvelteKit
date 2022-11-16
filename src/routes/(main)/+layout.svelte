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
  console.warn('path', path);
</script>

<svelte:head>
  <title>Build a custom area profile</title>
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

