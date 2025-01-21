import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte';
import mkcert from "vite-plugin-mkcert"

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), mkcert()],
  //plugins: [svelte()]
  assetsInclude: ['**/*.glb','**/*.png', "**/*.patt", "**/*.svelte"],
   server: {
     https: true,
   }
})
