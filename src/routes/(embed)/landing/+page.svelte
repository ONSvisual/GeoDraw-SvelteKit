<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import pym from "pym.js";
  import Select from "$lib/ui/Select.svelte";
  import Icon from "$lib/ui/Icon.svelte";

  let pym_child;
  let code = null;

  onMount(() => {
    pym_child = new pym.Child({id: 'embed', polling: 1000});
  });
</script>

<svelte:head>
  <meta name="googlebot" content="noindex,indexifembedded" />
</svelte:head>

<main>
  <h2>Find your area</h2>
  <label for="search">Find a ready-made area to start building your custom profile. Available areas include local authorities, wards, parishes and parliamentary constituences.</label>
  <Select autoClear={false} placeholder="Type an area name or postcode" on:select={(e) => code = e.detail.areacd} />
    <button disabled={!code} on:click={() => window.top.location.href = `${base}/draw/#${code}`}>
      <span>Edit on map</span>
    </button>
    <button class="confirm" disabled={!code} on:click={() => window.top.location.href = `${base}/build/#${code}`}>
      <span>Build profile</span>
      <Icon type="chevron"/>
    </button>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-size: 18px;
  }
  main {
    background-color: #F4F7FA;
    max-width: 680px;
    margin: 0 auto;
    padding: 24px;
    font-size: 1rem;
  }
  h2, label {
    display: block;
    color: #206095;
    padding: 0;
    margin: 0 0 24px !important;
  }
  h2 {
    font-weight: bold;
  }
  label {
    font-size: 1rem;
  }
  button {
    display: inline-flex;
    justify-items: center;
    align-items: center;
    height: 42px;
    border: none;
    border-radius: 0;
    margin: 24px 4px 0 0;
    padding: 0 0.5em;
    background-color: #bbb;
    font-family: "Open Sans",Helvetica,sans-serif;
    font-size: 1rem;
  }
  button > span {
    padding: 0 0.2em;
  }
  button.confirm {
    background-color: #0F8243;
    color: white;
  }
  button:disabled {
    opacity: 60%;
  }
</style>