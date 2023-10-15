<script lang="ts">
    import { Socket, io } from "socket.io-client";
    import { ChatOperational } from "carbon-icons-svelte"
    import { onMount } from "svelte";
    
    let connection: Socket;

    interface AdminPreviewForChat {
        name: string,
        messages: { content: string, user_id: string, date: Date }[],
        id: string,
        creation_date: Date
    }

    let chats: AdminPreviewForChat[] = [];
    
    function goToChat() {
        connection.emit("get-admin-chats", (success: boolean, chatsPayload: AdminPreviewForChat[]) => {
            chats = chatsPayload;
        });
    }

    onMount(() => {
        connection = io("http://localhost:10501", {
            withCredentials: true
        });
        setTimeout(goToChat, 1_000)
    })
</script>

<div>
    <div class="chats">
        {#each chats as chat}
            <button id="chat" on:click={goToChat}>
                <ChatOperational size={24}/>
                <p>{chat.name ? chat.name : new Date(chat.creation_date).toLocaleString()}</p>
            </button>
        {/each}
    </div>
</div>