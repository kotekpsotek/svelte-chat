<script lang="ts">
    import { Socket, io } from "socket.io-client";
    import { ChatOperational, ProgressBarRound } from "carbon-icons-svelte"
    import { onMount } from "svelte";
    import ChatDetermined from "./ChatDetermined.svelte";
    import ChatComp from "../../../../../client/Chat.svelte"
    import type { Chat as ChatType } from "../../../../../../types";
    import AlertSvelte from "../../../../../../lib/client/Alert.svelte"
    import Alert from "../../../../../../lib/client/Alert.svelte";
    
    let connection: Socket;
    let chats: ChatType[] = [];

    let loading: boolean = true;
    let adminEmail: string;
    
    function goToChat() {
        loading = true;
        connection.emit("get-admin-chats", (success: boolean, chatsPayload: ChatType[]) => {
            chats = chatsPayload;
            loading = false;
        });
    }

    
    let chatOpened = false;
    let chatG: Partial<ChatType> = {};
    function openChat(chat: ChatType) {
        return () => {
            chatOpened = true;
            connection.emit("join-to-chat", chat.id, adminEmail);
            chatG = chat;
        }
    }

    onMount(() => {
        connection = io("http://localhost:10501", {
            withCredentials: true
        });

        const url = new URL(document.URL);
        const redFrom = url.searchParams.get("red_from");

        if (redFrom) {
            new Alert({
                target: document.body,
                props: {
                    type: "info",
                    message: "You had been redirected to panel page. Before this alret close itself you should know that this route is only one appropriate to manage all chats as admin!",
                    temporaryMs: 20_000 // 20 seconds
                }
            })
        }

        connection.emit("admin-get-email", (email: string | undefined) => {
            if (!email) {
                alert("you probably isn't logged in")
            } 
            else adminEmail = email;
        });

        connection.on("admin-new-chat-arrived", (chat: ChatType) => {
            const append = new AlertSvelte({
                target: document.body,
                props: {
                    type: "info",
                    message: `New chat had arrived from user ${chat.user_creator}`,
                    temporaryMs: 15_000 // 15 seconds
                }
            })
            chats = [chat, ...chats];
        });
        
        setTimeout(goToChat, 1_000)
    })
</script>


{#if !chatOpened}
    <div class="panel">
        <h1>Admin Panel</h1>
        <div class="chats">
            {#if !loading}
                {#if chats.length}
                    {#each chats as chat}
                        <button id="chat" on:click={openChat(chat)}>
                            <ChatOperational size={24}/>
                            <p>{chat.name ? chat.name : new Date(chat.creation_date).toLocaleString()}</p>
                        </button>
                    {/each}
                {:else}
                    <div class="no-chats">
                        <p>No chats, No worry 🕳️!</p>
                    </div>
                {/if}
            {:else}
                <div class="loading">
                    <div>
                        <div id="animation">
                            <ProgressBarRound size={32}/>
                        </div>
                        <p>Loading...</p>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{:else}
    <ChatComp {connection} chat={chatG} userId={adminEmail} on:close-chat={_ => chatOpened = false} on:hide-chat-messages={_ => chatOpened = false}/>
{/if}

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

    .no-chats {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        font-weight: 700;
    }

    .loading {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
    }

    .loading > div:first-of-type {
        display: flex;
        column-gap: 10px;
        justify-content: center;
        align-items: center;
    }

    #animation {
        animation: rotate 300ms linear forwards infinite;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>
