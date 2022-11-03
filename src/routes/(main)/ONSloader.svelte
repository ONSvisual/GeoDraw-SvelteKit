<script>
    export let isLoading = true;
    let body;
</script>


{#if isLoading}
<div id="loading">
    <div id="img" class="c-animated-background">
      <img src="/ons-logo.svg"  /> |Loading the Custom Area Profile Builder Tools|
    </div>
  </div>
  {/if}

  <style>
    /*
    * Prefixed by https://autoprefixer.github.io
    * PostCSS: v8.4.14,
    * Autoprefixer: v10.4.7
    * Browsers: last 4 version
    */
    
    #loading {
        position: absolute !important;
        display: block;
        height: 100vh;
        width: 100vw;
        background:rgba(250,250,250,0.9)!important;
        z-index: 9999;
background-image:  -o-repeating-radial-gradient( 0 0, circle, transparent 0, #e5e5f7 104px ), -o-repeating-linear-gradient( #0f102655, #4f4f51 );

      }
    
      #img {
        width: 40vw;
        height: auto;
        margin-top: 43vh;
        margin-left:10px;
        position: absolute;
        opacity: 1;
       
      }
    
      @keyframes placeHolderShimmer {
        0% {
          mask-position: 0px 0;
        }
        100% {
          mask-position: 100em 0;
        }
      }
    
    
    
    .c-animated-background {
      -webkit-animation-duration: 3s;
              animation-duration: 3s;
      -webkit-animation-fill-mode: forwards;
              animation-fill-mode: forwards;
      -webkit-animation-iteration-count: infinite;
              animation-iteration-count: infinite;
      -webkit-animation-name: placeHolderShimmer;
              animation-name: placeHolderShimmer;
      -webkit-animation-timing-function: linear;
              animation-timing-function: linear;
      background: fff;
      -webkit-mask-image: -webkit-gradient(
          linear,
    
          left top, right top,
    
          from(rgba(0, 0, 0, 1)),
          color-stop(8%, rgba(0, 0, 0, 0)),
          color-stop(30%, rgba(0, 0, 0, 1))
        );
      -webkit-mask-image: linear-gradient(
          to right,
    
          rgba(0, 0, 0, 1) 0%,
          rgba(0, 0, 0, 0) 8%,
          rgba(0, 0, 0, 1) 30%
        );
              mask-image: -webkit-gradient(
          linear,
    
          left top, right top,
    
          from(rgba(0, 0, 0, 1)),
          color-stop(8%, rgba(0, 0, 0, 0)),
          color-stop(30%, rgba(0, 0, 0, 1))
        );
              mask-image: linear-gradient(
          to right,
    
          rgba(0, 0, 0, 1) 0%,
          rgba(0, 0, 0, 0) 8%,
          rgba(0, 0, 0, 1) 30%
        );
    
    
    
    }
    
    
    
    
    
    
    
    </style>