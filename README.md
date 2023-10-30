# Svelte-Chat
The complex chat solution for modern applications

## Swift description
Designed for Svelte applications chat which offers your clients top-level chat experiences and full power to administrate for your management team

## Installation (as always - for npm)
```bash
$ npm i svelte-chat
```

## Two Usage Step Sides - is really straight forward
***1st:*** Use **svelteChatPlugin** which also embedds administration functionalities
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteChatPlugin } from "./src/lib/server/main.js"

export default defineConfig({
	plugins: [sveltekit(), svelteChatPlugin]
});
```
***2nd:*** Attach client interaction button to your SvelteKit App. Like below or similary:
```svelte
// Route: /src/routes/+layout.svelte
<script>
    import { SvelteChatButton } from "svelte-chat";
</script>

</slot>
<SvelteChatButton/>
```
***3rd:*** You're behind finish line. Let's take fun from usage, in all scenarios

## License
All what you should know about Copyrights is that all code base is under <u>GPLv3</u>
