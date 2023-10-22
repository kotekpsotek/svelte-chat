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
    let newChatId: string | undefined;
    
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

    function onCloseChat() {
        chatOpened = false;

        // Unmark last chat as new one
        if (chatG.id == newChatId) {
            newChatId = undefined;
        }
    }

    /** Remove chat deleted by admin from list */
    function onRemoveChat({ detail: { id: chatId } }: CustomEvent<{ id: string }>) {
        const chatPositionOnList = chats.findIndex(v => v.id == chatId);
        const deletedChat = chats.splice(chatPositionOnList, 1);
        chats = chats;
    }

    onMount(() => {
        connection = io("http://localhost:10501", {
            withCredentials: true
        });

        const url = new URL(document.URL);
        const redFrom = url.searchParams.get("red_from");
        const justSignin = url.searchParams.has("signin");

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
        else if (justSignin) {
            new Alert({
                target: document.body,
                props: {
                    type: "info",
                    message: "You are signed-in. You had been signed-in moment ago",
                    temporaryMs: 10_000 // 20 seconds
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
            });

            // Mark this chat as new one
            newChatId = chat.id;

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
                        <button id="chat" class:new-chat={chat.id == newChatId} on:click={openChat(chat)}>
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
    <ChatComp {connection} adminMode={true} chat={chatG} userId={adminEmail} on:close-chat={onCloseChat} on:hide-chat-messages={onCloseChat} on:remove-chat={onRemoveChat}/>
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

    button.new-chat {
        background-color: black !important;
        color: white !important;
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
