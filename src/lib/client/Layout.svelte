<script lang="ts">
    import { Chat, ChatLaunch, Return, AddComment, Add, Close, SendFilled } from "carbon-icons-svelte";
    import { io , type Socket} from "socket.io-client";
    import { onMount } from "svelte";
    import connection from "./connection.js";
    import ChatPrompt from "./ChatPrompt.svelte";

    let chatStateShow = false;
    let conversationShowState = false;

    let myId = "1"
    let chatsList: Record<string, any>[] = []
    let chat = {
        id: "",
        name: "",
        messages: [
            {
                user_id: "1",
                content: "Message 1",
                date: Date.now()
            },
            {
                user_id: "2",
                content: "Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2".replaceAll(" ", ""),
                date: Date.now()
            },
            {
                user_id: "1",
                content: "Message 1",
                date: Date.now()
            },
        ],
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

        node.style.width = document.body.clientWidth - (cIW + 15) + "px";
        
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

    /** Manage focus on input to pass new message content */
    let focusOnMessageInput = false;
    function focusMessageInput(state: boolean) {
        return () => {
            focusOnMessageInput = state;
        }
    }
    
    /** Send new message */
    let messageChatContent: string = "";
    function sendNewMessage() {
        if (messageChatContent.length) {
            $connection?.emit("new-message", myId, chat.id, messageChatContent, (success: boolean, message: typeof chat.messages[0] | undefined) => {
                if (success && message) {
                    chat.messages = [...chat.messages, message];
                    messageChatContent = "";
                }
                else alert("Couldn't send message. Please try again!");
            });
        }
    }

    onMount(() => {
        $connection = io("http://localhost:10501");
        const getId = (() => {
            let uId = localStorage.getItem("weeeeee-chatttt-id");

            if (!uId) {
                // Id doesn't exists
                $connection!.emit("generate-my-id", (id: string) => {
                    myId = id;
                    localStorage.setItem("weeeeee-chatttt-id", id);
                });
            } 
            else {
                // Id does exists
                myId = uId;
            }

            return uId;
        })();

        // Get user chats list
        downloadChats();

        // Durning window size change
        window.addEventListener("resize", () => {
            // Change size for <section class="chat"> element
            spawnChatSection(document.querySelector('section.chat')!)
        })

        // Send message when user has got focus on input to pass new message content
        window.addEventListener("keypress", ({ code }) => {
            if (code == "Enter") sendNewMessage();
        });

        // Capture new messages from other "client" in room
        $connection.on("capture-new-message", (newMessage: typeof chat.messages[0]) => {
            chat.messages = [...chat.messages, newMessage];
        });
    })
</script>

<button class="chat-action" id="c-ico" on:click={loadChat}>
    <Chat size={32} fill="white"/>
</button>
{#if chatStateShow}
    <!-- TODO: 1. List of stated prior chats by date, 2. Chat messages, 3. Ability to send new message -->
    <section class="chat" use:spawnChatSection>
        <div class="upper">
            <!-- Close chat element -->
            {#if !conversationShowState}
                <h1>Chats list</h1>
            {:else}
                <button class="go-back" on:click={showOrHideChatMessages(undefined)}>
                    <Return size={24}/>
                </button>
                <h1>Chat conversation ({chat.name.length ? chat.name : "No Name"})</h1>
            {/if}
            <button id="close-chat" on:click={closeChat}>
                <Close size={32} fill="white"/>
            </button>
        </div>
        {#if !conversationShowState}
            <main class="chats-list">
                <!-- Chats list -->
                {#if chatsList.length}
                    {#each chatsList as chat}
                        <button class="entity" on:click={showOrHideChatMessages(chat.id)}>
                            <ChatLaunch size={24}/>
                            <p class="n">{chat.name || new Date(chat.creation_date).toISOString()}</p>
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
            <main class="messages">
                {#if chat.messages.length}
                    <div class="messages-markup">
                        {#each chat.messages as message}
                            <div class="c" class:my={message.user_id == myId}>
                                <div>
                                    <p>{message.content}</p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="no-messages">
                        <p>💬 Chat is empty. Let's fill it 📟!</p>
                    </div>
                {/if}
                <div class="write-message">
                    <input type="text" placeholder="Message..." bind:value={messageChatContent} on:focus={focusMessageInput(true)} on:blur={focusMessageInput(false)}>
                    <button title="send" on:click={sendNewMessage}>
                        <SendFilled size={24} fill="white"/>
                    </button>
                </div>
            </main>
        {/if}
       <!--  <div class="msg">
            <input type="text" bind:value={newMessageContent}>
            <button on:click={sendNewMessage}>
                Send
            </button>
        </div> -->
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

    .upper button.go-back {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: brightness(0.5);
        transition: all linear 100ms;
        margin-right: 10px;
    }

    .upper button.go-back:hover {
        background-color: rgb(35, 35, 35);
        filter: brightness(1.0);
        box-shadow: 0px 0px 10px rgb(85, 85, 85);
    }

    main.chats-list {
        color: black;
        width: 100%;
        height: calc(100% - 55px);
        /* padding: 5px; */
    }

    main.messages {
        width: 100%;
        height: calc(100% - 55px);
        /* padding: 5px; */
        display: flex;
        flex-direction: column;
        row-gap: 1px;
    }

    main.messages div.c {
        width: 100%;
        display: flex;
        justify-content: flex-start;
    }

    main.messages div.c.my {
        justify-content: flex-end;
    }

    main.messages div.c div {
        width: fit-content;
        max-width: 49%;
        background-color: blue;
        color: white;
        border-radius: 15px;
        padding: 5px;
    }

    main.messages div.c.my div {
        background-color: black;
    }

    main.messages div.c div p {
        text-wrap: balance;
        word-wrap: break-word;
    }

    main.messages .no-messages {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 5px;
        color: grey;
    }

    main.messages .messages-markup {
        box-sizing: border-box;
        width: 100%;
        height: calc(100% - 80px);
        padding: 5px;
        overflow-y: auto;
    }

    main.messages .write-message {
        height: 80px;
        display: flex;
        align-items: center;
        background-color: whitesmoke;
        padding-left: 5px;
        padding-right: 5px;
    }

    main.messages .write-message input {
        width: 95%;
        height: 50%;
        padding-left: 5px;
        padding-right: 5px;
        border: solid 1px grey;
        border-right: none;
        border-radius: 5px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        outline: none;
    }

    main.messages .write-message button {
        width: 5%;
        height: 52%;
        border: 1px grey solid;
        border-left: none;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        background-color: black;
        cursor: pointer;
    }
</style>
