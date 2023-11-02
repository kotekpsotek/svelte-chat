import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { chatPlugin } from "./src/lib/server/as-plugin.js"

export default defineConfig({
	plugins: [sveltekit(), chatPlugin(true)]
});
