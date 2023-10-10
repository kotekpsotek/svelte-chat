import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteChatPlugin } from "./src/lib/server/main.js"

export default defineConfig({
	plugins: [sveltekit(), svelteChatPlugin]
});
