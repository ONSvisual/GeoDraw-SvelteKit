<script>
  // import './app.css';
  import {assets} from '$app/paths';
  import {page} from '$app/stores';
  import {setContext} from 'svelte';
  // import "../app.css";
  import {themes} from '$lib/config';
  import Warning from '$lib/ui/Warning.svelte';
  //  import ONSHeader from "$lib/layout/ONSHeader.svelte";
  import ONSHeader from '$lib/layout/ONSHeader.svelte';


  let path = $page.url.pathname;
  let lang = $page.url.hostname.split('.')[0] == 'cy' ? 'cy' : 'en';
  let baseurl = lang == 'cy' ? '//cy.ons.gov.uk' : '//www.ons.gov.uk';

  let margin_top;

  // STYLE CONFIG
  // Set theme globally (options are 'light' or 'dark')
  // let theme = 'light';
  // setContext('theme', themes[theme]);
</script>

<Warning bind:height={margin_top}>
  WARNING! This is a prototype. Data likely to contain inaccuracies.
</Warning>

<ONSHeader {margin_top}/>

<main>
  <slot />
</main>

<style>
  :root {
    --header-1-height: clamp(2em, 5vh, 3em);
  }
  :global(body) {
    margin: 0 !important;
    padding: 0 !important;
    left: 0 !important;
    top:0 !important;
  }
  .onslogo {
    height: calc(var(--header-1-height) * 0.8) !important;
    width: auto;
    float: left;
  }
  div svg {
    float: right;
    height: calc(var(--header-1-height) * 0.4) !important;
    width: auto;
    position: relative;
    display: flex;
    /* padding-top:calc(var(--header-1-height) * 0.2); */
  }
  #layouthead {
    height: var(--header-1-height) !important;
    width:100vw!important;
    left:0;
    /* border-bottom: 1px solid rgba(34, 34, 34, 0.358); */
    background-image: linear-gradient(to right, whitesmoke, white, whitesmoke);
    position: fixed;
    top: 0;
    display: block;
    z-index: 99999999;

  }
</style>
