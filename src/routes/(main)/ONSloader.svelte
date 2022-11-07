<script>
    export let isLoading = true;
    let body;
</script>


{#if isLoading}
<div id="loading">



    <div id="img" class="c-animated-background">
      <img src="/ons-logo.svg"  /> 
    </div>
    

    <div style='width:200px;height:200px' class="h-screen flex justify-center items-center">
      <div class="" role="alert" aria-live="assertive">
        <p class="sr-only">Loading...</p>
        <div class="animate-delayedfadein">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-ons-census "
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
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
        max-width:200px;
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