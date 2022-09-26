<script>
  import "../app.css";
  import ONSHeader from "$lib/layout/ONSHeader.svelte";
  import Title from "$lib/layout/Title.svelte";
  import { page } from '$app/stores';


  let path = $page.url.pathname;

</script>



<svelte:head>
  {#if path === '/build'}
  <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.1/lib/bundle.js"></script>
  {:else if path === '/draw'}
  <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.1/lib/bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/flatbush"></script>
  {/if}

  <title>Build a custom area profile</title>
</svelte:head>

<main>
	<header>
		<ONSHeader/>
		<Title/>
	</header>
  <slot/>
</main>