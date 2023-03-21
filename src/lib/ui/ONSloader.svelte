<script>
    export let isLoading = true;
    let body;
</script>


{#if isLoading}
<div id="loading">
  <div class="spinner-border">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
{/if}

<style>
  #loading {
    z-index: 1000;
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(255,255,255,.7);
  }
  .spinner-border {
    box-sizing: border-box;
    display: inline-block;
    width: 1.4rem;
    height: 1.4rem;
    border: 0.25em solid rgba(144,32,130,.5);
    border-right-color: rgb(144,32,130);
    border-radius: 50%;
    margin: auto;
    animation: .75s linear infinite spinner-border;
  }
  @keyframes spinner-border {
    100% {
      transform: rotate(360deg);
    }
  }
  .visually-hidden {
    position: absolute!important;
    width: 1px!important;
    height: 1px!important;
    padding: 0!important;
    margin: -1px!important;
    overflow: hidden!important;
    clip: rect(0,0,0,0)!important;
    white-space: nowrap!important;
    border: 0!important;
  }
</style>