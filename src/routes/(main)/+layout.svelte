<script>
  import '../../app.css';
  import ONSHeader from '$lib/layout/ONSHeader.svelte';
  import Title from '$lib/layout/Title.svelte';
  import {page} from '$app/stores';

  let path = $page.url.pathname;
  // console.clear();
  console.warn('path', path);

  var isLoading = true;
</script>

<svelte:head>
  <script
    sync
    src="https://cdn.jsdelivr.net/npm/danfojs@1.1.1/lib/bundle.js"
  ></script>

  <!-- {:else if path === '/population/'}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/6.6.3/math.min.js"></script> 
   <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js"> </script>
  <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.1/lib/bundle.js"> </script>
 -->

  <title>Build a custom area profile</title>

  <script defer>
  </script>
</svelte:head>

{#if isLoading}{/if}

<main>
  <header>
    <ONSHeader />
    <Title />
  </header>

  <slot />


</main>

