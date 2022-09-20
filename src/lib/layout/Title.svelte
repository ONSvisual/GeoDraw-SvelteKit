<script>
  export let title="Build a custom area profile";
  export let badge="Alpha";
</script>

<div class="title-block">
	<h1>{title}</h1>
  {#if badge}
  <a href="https://www.ons.gov.uk/feedback" target="_blank" class="ons-phase-banner__badge">
    <h3>{badge}</h3>
  </a>
  {/if}
</div>

<style>
	.title-block {
		display: flex;
		flex-direction: row;
		align-items: center;
		color: white;
		background-color: #206095;
		height: 54px;
	}
	.title-block > h1 {
		font-size: 1.44em;
		margin: 0 0 3px 15px;
	}
  @media screen and (max-width: 420px) {
    .title-block > h1 {
		font-size: 1.26em;
    }
  }
  .ons-phase-banner__badge {
    text-decoration: none;
  }
  .ons-phase-banner__badge > h3 {
    font-weight: 600;
    display: block;
    background: #222;
    color: #fff;
    font-size: 15.3px;
    line-height: 1em;
    margin: 0 12px!important;
    padding: 0.4rem;
    text-transform: uppercase;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
  }
</style>