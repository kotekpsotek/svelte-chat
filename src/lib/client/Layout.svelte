<script lang="ts">
    import { Chat, ChatLaunch, Return, AddComment, Add } from "carbon-icons-svelte";
    import { io , type Socket} from "socket.io-client";
    import { onMount } from "svelte";
    import connection from "./connection.js";
    import ChatPrompt from "./ChatPrompt.svelte";

    let chatStateShow = true;
    let conversationShowState = false;

    let newMessageContent: string = "";

    function loadChat() {
        chatStateShow = !chatStateShow;
    }

    let myId = "1"
    let chat = {
        id: "",
        title: "",
        messages: [
            {
                from: "1",
                content: "Message 1",
                date: Date.now()
            },
            {
                from: "2",
                content: "Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2Message 2".replaceAll(" ", ""),
                date: Date.now()
            },
        ],
        creation_date: new Date()
    }
    function showOrHideChatMessages() {
        conversationShowState = !conversationShowState;
    }

    function sendNewMessage() {

    }

    function spawnChatList(node: HTMLElement) {
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
                chat.title = title || new Date(creationDate).toLocaleDateString();
                chat.messages = messages as any || [],
                chat.creation_date = new Date(creationDate);
                conversationShowState = true
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
    })
</script>

<button class="chat-action" id="c-ico" on:click={loadChat}>
    <Chat size={32} fill="white"/>
</button>
{#if chatStateShow}
    <!-- TODO: 1. List of stated prior chats by date, 2. Chat messages, 3. Ability to send new message -->
    <section class="chat" use:spawnChatList>
        {#if !conversationShowState}
            <div class="upper">
                <h1>Chats list</h1>
            </div>
            <main class="chats-list">
                <!-- Chats list -->
                <button class="entity" on:click={showOrHideChatMessages}>
                    <ChatLaunch/>
                    <p class="n">Chat new name</p>
                </button>
            </main>
            <div class="bottom">
                <button id="new" on:click={createNewQuestion}>
                    <p>Give Question</p>
                    <AddComment size={24} fill="white"/>
                </button>
            </div>
        {:else}
            <div class="upper">
                <button class="go-back" on:click={showOrHideChatMessages}>
                    <Return size={24}/>
                </button>
                <h1>Chat conversation ({chat.title.length ? chat.title : "No Name"})</h1>
            </div>
            <main class="messages">
                {#each chat.messages as message}
                    <div class="c" class:my={message.from == myId}>
                        <div>
                            <p>{message.content}</p>
                        </div>
                    </div>
                {/each}
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
        width: 100%;
        height: 55px;
        display: flex;
        align-items: center;
        /* padding-left: 5px; */
        /* padding-right: 5px; */
        color: white;
        background-color: rgb(24, 24, 24);
    }

    section.chat .chats-list {
        width: 100%;
        height: calc(var(--one-per-height) * 90);
        display: flex;
        flex-direction: column;
        gap: 2px;
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

    main.chats-list .entity {
        height: 50px;
        width: 100%;
        background-color: whitesmoke;
        display: flex;
        align-items: center;
        gap: 5px;
        padding-left: 5px;
        padding-right: 5px;
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
</style>
