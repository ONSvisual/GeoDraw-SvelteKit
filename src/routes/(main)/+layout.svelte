<script>
  import "$lib/css/app.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { centroids } from "$lib/stores/mapstore.js";
  import { GetCentroids } from "$lib/util/centroid-utils.js";
  import AnalyticsBanner from "$lib/layout/AnalyticsBanner.svelte";
  import ONSHeader from "$lib/layout/ONSHeader.svelte";
  import ONSFooter from "$lib/layout/ONSFooter.svelte";
  import Title from "$lib/layout/Title.svelte";
  import { points, lsoaPoints } from '$lib/config/geography';

  let loaded = false;

  onMount(async () => {
    // calculate the centroids and simplifications.
    var centroidDummy = await GetCentroids([points,lsoaPoints]);
    centroids.set(centroidDummy);
    loaded = true;
  });

  // GOOGLE ANALYTICS
  // Settings for page analytics. Values must be shared with <AnalyticsBanner> component
  const analyticsId = "GTM-MBCBVQS";
  const analyticsProps = {
    contentTitle: "Build a custom area profile",
    releaseDate: "20230117",
    contentType: "exploratory",
    outputSeries: "buildacustomareaprofile",
  };
</script>

<svelte:head>
  <title>Build a custom area profile - Census 2021, ONS</title>
  <meta
    property="og:title"
    content="Build a custom area profile - Census 2021, ONS"
  />
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://www.ons.gov.uk/visualisations/customprofiles/draw/"
  />
  <meta
    property="og:image"
    content="https://www.ons.gov.uk/visualisations/customprofiles/img/og.png"
  />
  <meta property="og:image:type" content="image/png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    property="og:description"
    content="Create your own profile for local areas in England and Wales using Census 2021 data."
  />
  <meta
    name="description"
    content="Create your own profile for local areas in England and Wales using Census 2021 data. Data topics include population, age, sex, ethnicity, religion, the work people do, and the homes they live in."
  />
</svelte:head>

<AnalyticsBanner {analyticsId} {analyticsProps} />
<main>
  <header>
    <ONSHeader />
    <Title />
  </header>

  {#if loaded}
    <slot />
  {/if}
</main>

{#if $page.url.pathname.includes("build")}
  <ONSFooter />
{/if}
