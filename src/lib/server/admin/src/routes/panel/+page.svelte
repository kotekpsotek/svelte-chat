<script lang="ts">
    import { Socket, io } from "socket.io-client";
    import { ChatOperational } from "carbon-icons-svelte"
    import { onMount } from "svelte";
    import ChatDetermined from "./ChatDetermined.svelte";
    
    let connection: Socket;
    let chats: AdminPreviewForChat[] = [];
    
    function goToChat() {
        connection.emit("get-admin-chats", (success: boolean, chatsPayload: AdminPreviewForChat[]) => {
            chats = chatsPayload;
        });
    }

    function openChat(chat: AdminPreviewForChat) {
        return () => {
            const chatOpened = new ChatDetermined({
                target: document.body,
                props: {
                    connection,
                    chat
                }
            })
        }
    }

    onMount(() => {
        connection = io("http://localhost:10501", {
            withCredentials: true
        });
        setTimeout(goToChat, 1_000)
    })
</script>

<div class="panel">
    <h1>Admin Panel</h1>
    <div class="chats">
        {#each chats as chat}
            <button id="chat" on:click={openChat(chat)}>
                <ChatOperational size={24}/>
                <p>{chat.name ? chat.name : new Date(chat.creation_date).toLocaleString()}</p>
            </button>
        {/each}
    </div>
</div>

<style>
    .panel {
        padding: 10px;
        width: 100vw;
        height: 100vh;
        overflow-y: auto;
        background-color: rgb(201, 201, 201);
    }

    .chats {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        height: fit-content;
    }
    
    .chats #chat {
        height: 55px;
        padding-left: 10px;
        padding-right: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        column-gap: 10px;
        border-radius: 0px;
        background-color: white;
        color: black;
        border-bottom: 1px black solid;
        font-weight: 500;
    }

    .chats #chat:last-of-type {
        border-bottom: none;
    }
</style>
