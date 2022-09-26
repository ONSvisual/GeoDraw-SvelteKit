// import {default as adapter} from '@sveltejs/adapter-node';
// import adapter from '@sveltejs/adapter-static';
import adapter from '@sveltejs/adapter-netlify';
// import adapter from '@sveltejs/adapter-vercel';
const production = process.env.NODE_ENV === 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // options passed to svelte.compile (https://svelte.dev/docs#svelte_compile)
  compilerOptions: null, //{format:'cjs'},

  // an array of file extensions that should be treated as Svelte components
  extensions: ['.svelte'],
  
  kit: {
    // adapter: adapter (),
    // amp: false,
    // edge: false,
    // split: true,
    
    appDir: '_app',
    files: {
      assets: 'static',
      // hooks: 'src/hooks',
      lib: 'src/lib',
      routes: 'src/routes',
      serviceWorker: 'src/service-worker',
      appTemplate: 'src/app.html',
    },
    // floc: true,
    // browser:{hydrate: true},
    browser: {
      hydrate: true,
      router: true
    },
    paths: {
      assets: '',
      base: '',
    },
    // prerender: {
    // 	crawl: true,
    // 	// enabled: true,
    // 	force: false,
    // 	pages: [process.cwd()+'/src/*'],
    // 	// default: true,
    // 	enabled: production,
    // 	// onError: 'continue'
    // },
    // router: true,
    // ssr: true,

    // paths: {
    // 	base: production ? '/custom_area' : ''
    // },
    // trailingSlash: 'always',

    // options passed to svelte.preprocess (https://svelte.dev/docs#svelte_preprocess)
    // preprocess: null
  },
};

// https://github.com/sveltejs/kit/issues/1278

export default config;
