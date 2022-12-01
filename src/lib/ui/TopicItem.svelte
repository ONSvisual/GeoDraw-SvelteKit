<script>
  import Icon from "$lib/ui/Icon.svelte";

  export let topic; // Topic of this item
  export let regex;
  export let show;

  let showInfo = false;

  function highlight(str, regex) {
    return regex ? str.replace(regex, '<mark>$&</mark>') : str;
  }
</script>

<div class="topic-item" style:display={show ? 'flex' : 'none'}>
  <label>
    <slot/>
    {@html highlight(topic.label, regex)}
  </label>
  <button
    class="topic-toggle"
    title="{showInfo ? 'Hide' : 'Show'} description for {topic.label}"
    on:click={() => showInfo = !showInfo}
    >
    <Icon type="info"/>
  </button>
</div>

{#if show && showInfo}
<div class="topic-info">
{topic.desc}
{#if topic.url}
<a href="https://www.ons.gov.uk/census/census2021dictionary/variablesbytopic/{topic.url}" target="_blank">Read more</a>
{/if}
</div>
{/if}

<style>
  .topic-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 4px 0 1px;
  }
  .topic-item > label:focus-within {
    outline: 2px solid orange;
    flex-grow: 1;
  }
  .topic-info {
    margin: 0;
    padding: 16px;
    background-color: rgb(245,245,246);
    border-left: 4px solid rgb(112,112,113);
  }
  .topic-toggle {
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    font-size: 0.8em;
    width: 18px;
    color: #444;
  }
  .topic-toggle:hover, .topic-toggle:active {
    color: #000;
    background: none !important;
  }
  .topic-toggle:focus {
    outline: 2px solid orange;
  }
</style>