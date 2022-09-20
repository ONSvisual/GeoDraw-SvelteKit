<script>
  import "../app.css";
  import ONSHeader from "$lib/layout/ONSHeader.svelte";
  import Title from "$lib/layout/Title.svelte";
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.1/lib/bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/flatbush"></script>

  <title>Build a custom area profile</title>
</svelte:head>

<main>
	<header>
		<ONSHeader/>
		<Title/>
	</header>
  <slot/>
</main>