<script>
  import Icon from "$lib/ui/Icon.svelte";
</script>

<div class="notice-container">
  <div class="notice-icon">
    <Icon type="error"/>
  </div>
  The data displayed in this profile is aggregated from small area data. The values may vary slightly from official ONS datasets.
</div>

<style>
  .notice-container {
    position: relative;
    display: block;
    padding: 12px 12px 12px 44px;
    background-color: rgb(245,245,246);
    border-left: 4px solid rgb(112,112,113);
    margin: 4px 0 12px;
  }
  .notice-icon {
    position: absolute;
    font-size: 1.2em;
    transform: translate(-30px, 3px);
  }
</style>