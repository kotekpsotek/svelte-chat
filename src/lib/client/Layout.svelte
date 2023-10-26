<script lang="ts">
    import { ChatLaunch, Return, AddComment, Add, Close, SendFilled, Chat as ChatIco } from "carbon-icons-svelte";
    import { io, type Socket} from "socket.io-client";
    import { onMount } from "svelte";
    import connection from "./connection.js";
    import ChatPrompt from "./ChatPrompt.svelte";
    import ChatComp from "$lib/client/Chat.svelte"
    import Alert from "./Alert.svelte"
    import setIdCookie from "./lib.js";

    let chatStateShow = false;
    let conversationShowState = false;

    let myId = "1"
    let chatsList: (Record<string, any> & { new_messages?: number })[] = []
    let chat: Chat = {
        id: "",
        name: "",
        messages: [],
        creation_date: new Date()
    }

    /** Download chats list from socket.io server */
    const downloadChats = () => {
        $connection?.emit("get-chats", myId, (chats: Record<string, any>[]) => {
            chatsList = chats;
        })
    };

    function loadChat() {
        chatStateShow = !chatStateShow;

        if (chatStateShow) {
            // Get user chats list
            downloadChats()
        }
    }

    function showOrHideChatMessages(chatId?: string) {
        return () => {
            // Get chat messages
            if (!chatId) {
                // Emit leave user chat
                $connection?.emit("leave-chat", chat.id);
                
                // Get user chats list
                downloadChats()
            }
            else {
                // Emit join user to specific chat room
                $connection?.emit("join-to-chat", chatId, myId)
                
                // Download specified chat messages content
                const chatInternal = chatsList.find(c => c.id == chatId);
                chat = chatInternal as any;
            }
            
            // Show chat messages
            conversationShowState = !conversationShowState;
        }
    }

    /** Add styles for spawn <section class="chat"> element */
    function spawnChatSection(node: HTMLElement) {
        const chatIcon = document.getElementById("c-ico");
        const cIW = chatIcon!.clientWidth;

        node.style.width = document.body.clientWidth + "px" /* - (cIW + 15) + "px" */;
        
        return {};
    }

    // After click on "give new question" button
    function createNewQuestion() {
        const additionalPrompt = new ChatPrompt({
            target: document.body,
        });

        additionalPrompt.$on("skip", () => {
            emit();
        });

        additionalPrompt.$on("confirm", () => {
            emit(additionalPrompt.caseTitle, additionalPrompt.firstQuestionContent);
        });

        const emit = (title?: string, messageContent?: string) => {
            additionalPrompt.$destroy();
            $connection?.emit("create-new-question", myId, title, messageContent, (chatId: string, creationDate: string, title: string | undefined, messages: Record<string, any>[] | undefined) => {
                chat.id = chatId;
                chat.name = title || new Date(creationDate).toLocaleDateString();
                chat.messages = messages as any || [],
                chat.creation_date = new Date(creationDate);
                conversationShowState = true
            });
        }
    }

    /** Ability to close chat are supply by this function */
    function closeChat() {
        chatStateShow = false;
        conversationShowState = false;
        chat = Object.create(null);
    }

    /** @description Delete chat */
    function deleteChat(chat_id: string) {
        const terminatedChatId = chatsList.findIndex(v => v.id == chat_id);
        const deletedChat = chatsList.splice(terminatedChatId, 1);
        chatsList = chatsList;

        return deletedChat;
    }

    onMount(() => {
        $connection = io("http://localhost:10501", {
            withCredentials: true
        });
        const getId = (() => {
            let uId = localStorage.getItem("weeeeee-chatttt-id");

            if (!uId) {
                // Id doesn't exists
                $connection!.emit("generate-my-id", (id: string) => {
                    myId = id;
                    uId = myId
                    localStorage.setItem("weeeeee-chatttt-id", id);
                });
            } 
            else {
                // Id does exists
                myId = uId;
            }

            return uId;
        })();

        // Set user id in cookie
        setIdCookie(myId);

        // Get user chats list
        downloadChats();

        // Durning window size change
        window.addEventListener("resize", () => {
            if (chatStateShow) {
                // Change size for <section class="chat"> element
                spawnChatSection(document.querySelector('section.chat')!)
            }
        });

        // Capture admin terminate user chat
        $connection?.on("chat-terminated-by-admin", (chat_id: string) => {
            // Close chat, only while user is in
            if (chat.id == chat_id) {
                conversationShowState = false;    
            }

            // Delete chat
            const del = deleteChat(chat_id)

            // Alert with information
            setTimeout(() => {
                new Alert({
                    target: document.body,
                    props: {
                        type: "info",
                        message: `Case '${del[0].name}' which has been opened by you was terminated by admin`,
                        temporaryMs: 5_000 // 5 seconds
                    }
                })
            })
        });

        // When admin delete chat which this user made
        $connection?.on("chat-deleted-by-admin-when-you-out-of-room", (chat_id: string) => {
            // Delete chat
            const del = deleteChat(chat_id);

            // Alert
            const infoAlert = new Alert({
                target: document.body,
                props: {
                    type: "info",
                    message: `Case '${del[0].name}' which has been opened by you was terminated by admin when you are out of`,
                    temporaryMs: 5_000 // 5 seconds
                }
            })
        });

        // Set that admin send new answer
        $connection?.on("admin-sent-response", (chat_id: string) => {
            const chatIdF = chatsList.findIndex(v => v.id == chat_id);
            chatsList[chatIdF].new_messages ? chatsList[chatIdF].new_messages! += 1 : chatsList[chatIdF].new_messages = 1;
            chatsList = chatsList
        });
    })
</script>

<button class="chat-action" id="c-ico" on:click={loadChat}>
    <ChatIco size={32} fill="white"/>
</button>
{#if chatStateShow}
    <!-- TODO: 1. List of stated prior chats by date, 2. Chat messages, 3. Ability to send new message -->
    <section class="chat" use:spawnChatSection>
        {#if !conversationShowState}
            <div class="upper">
                <!-- Close chat element -->
                <h1>Chats list</h1>
                <button id="close-chat" on:click={closeChat}>
                    <Close size={32} fill="white"/>
                </button>
            </div>
            <main class="chats-list">
                <!-- Chats list -->
                {#if chatsList.length}
                    {#each chatsList as chat}
                        <button class="entity" on:click={showOrHideChatMessages(chat.id)}>
                            <ChatLaunch size={24}/>
                            <p class="n">{chat.name || new Date(chat.creation_date).toISOString()}</p>
                            {#if chat.new_messages}
                                <div class="new-response">
                                    <section>
                                        <p>{chat.new_messages}</p>
                                    </section>
                                </div>
                            {/if}
                        </button>
                    {/each}
                {:else}
                    <div class="no-chats">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <p>👽🪐 You haven't any chat. Let's <span style="color: orangered; cursor: pointer;" on:click={createNewQuestion}>create new one</span>! 🌎☄️</p>
                    </div>
                {/if}
            </main>
            <div class="bottom">
                <button id="new" on:click={createNewQuestion}>
                    <p>Give Question</p>
                    <AddComment size={24} fill="white"/>
                </button>
            </div>
        {:else}
            <ChatComp userId={myId} chat={chat} connection={$connection} on:close-chat={closeChat} on:hide-chat-messages={showOrHideChatMessages(undefined)}/>
        {/if}
    </section>
{/if}

<style>
    @import url("./styles.css");
    
    * {
        font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .chat-action {
        position: absolute;
        bottom: 15px;
        right: 15px;
        background-color: black;
        padding: 15px;
        border-radius: 50%;
    }

    section.chat {
        --one-per-height: calc((100% - 55px) / 100);
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
        background-color: rgb(225, 225, 225);
        z-index: 100;
    }
    
    section.chat .upper {
        position: relative;
        width: 100%;
        height: 55px;
        display: flex;
        align-items: center;
        /* padding-left: 5px; */
        /* padding-right: 5px; */
        color: white;
        background-color: rgb(24, 24, 24);
    }

    .upper button#close-chat {
        position: absolute;
        right: 0px;
        top: 0px;
        width: 50px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        cursor: pointer;
        transition: all linear 50ms
    }

    .upper button#close-chat:hover {
        background-color: white;
        border: solid 1px grey;
    }

    section.chat .chats-list {
        width: 100%;
        height: calc(var(--one-per-height) * 90);
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .chats-list button.entity {
        height: 50px;
        width: 100%;
        background-color: whitesmoke;
        display: flex;
        align-items: center;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 15px;
        gap: 10px;
        transition: all linear 50ms;
        cursor: pointer;
        position: relative;
    }

    .chats-list button.entity:hover {
        box-shadow: 0px 0px 10px grey;
        border: solid grey 1px;
    }

    .chats-list .no-chats {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: grey;
    }
    
    section.chat .bottom {
        width: 100%;
        height: calc(var(--one-per-height) * 10);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 5px;
    }

    button#new {
        display: flex;
        padding: 15px;
        gap: 3px;
        color: white;
        align-items: center;
        text-transform: uppercase;
        font-weight: 700;
        background-color: black;
        border-radius: 5px;
        margin-right: 5px;
        cursor: pointer;
        transition: all linear 100ms;
    }

    button#new:hover {
        transform: scale(0.95);
        box-shadow: 0px 0px 15px gray;
    }
    
    .upper h1 {
        font-size: 25px;
        font-weight: 600;
    }

    main.chats-list {
        color: black;
        width: 100%;
        height: calc(100% - 55px);
        /* padding: 5px; */
    }

    button.entity .new-response {
        height: 100%;
        width: 45px;
        position: absolute;
        top: 0px;
        right: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .new-response section {
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: black;
        color: white;
        border-radius: 50%;
    }
</style>
