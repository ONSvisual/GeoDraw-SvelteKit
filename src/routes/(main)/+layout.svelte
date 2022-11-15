<script>
  import '../../app.css';
  import ONSHeader from '$lib/layout/ONSHeader.svelte';
  import Title from '$lib/layout/Title.svelte';
  import {page} from '$app/stores';

  let path = $page.url.pathname;
  console.warn('path', path);

  var isLoading = true;
</script>

<svelte:head>
  <script
    defer
    src="https://cdn.jsdelivr.net/npm/danfojs@1.1.1/lib/bundle.js"
  ></script>

  <title>Build a custom area profile</title>

</svelte:head>

<main>
  <header>
    <ONSHeader />
    <Title />
  </header>

  <slot />


</main>

