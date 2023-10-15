<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { Return } from "carbon-icons-svelte";
    import type { Socket } from "socket.io-client";

    export let connection: Socket;
    export let chat: AdminPreviewForChat;

    const dsp = createEventDispatcher();
</script>

<div class="chat-opened">
    <div class="upper">
        <button>
            <Return size={20}/>
        </button>
        <p>{chat.name || `Treat name not specified: ${new Date(chat.creation_date).toDateString()}`}</p>
    </div>
    <div class="messages">

    </div>
    <div class="write-answer-stripe">

    </div>
</div>
