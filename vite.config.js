import {sveltekit} from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit ({hydratable: true})],
  server: {
    watch: {
      ignored: ['**/static/**'], // undocumented in vite
    },
  },
};

export default config;
