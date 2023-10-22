<script lang="ts">
    import { Close, Return, SendFilled, IbmCloudHyperProtectCryptoServices } from "carbon-icons-svelte";
    import { onMount, createEventDispatcher } from "svelte";
    import type { Socket } from "socket.io-client";
    import AlertSvelte from "../client/Alert.svelte";
    import "./styles.css";

    export let userId: string;
    export let chat: ChatType;
    export let connection: Socket | undefined;
    export let adminMode: boolean = false;

    /** Events dispatcher */
    const dsp = createEventDispatcher();
    
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
            const messagesContainer = document.getElementsByClassName("messages-markup")[0];
            connection?.emit("new-message", userId, chat.id, messageChatContent, (success: boolean, message: typeof chat.messages[0] | undefined) => {
                if (success && message) {
                    chat.messages = [...chat.messages, message];
                    messageChatContent = "";
                    setTimeout(() => {
                        if (messagesContainer?.scrollHeight) messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    })
                }
                else alert("Couldn't send message. Please try again!");
            });
        }
    }

    /* Open and close admin options */
    let adminOptionsHasBeenOpened = false;
    function onOpenCloseAdminOptions() {
        adminOptionsHasBeenOpened = !adminOptionsHasBeenOpened
    }

    /* Terminate case by admin */
    function onAdminTerminateCase() {
        connection?.emit("terminate-chat", chat.id, (success: boolean) => {
            if (success) {
                // Remove currently open chat
                dsp("remove-chat", chat.id);
            }
            else new AlertSvelte({
                target: document.body,
                props: {
                    type: "error",
                    message: `You cannot terrminate chat`,
                    temporaryMs: 5_000 // 5 seconds
                }
            });
        })
    }

    onMount(() => {
        const messagesContainer = document.getElementsByClassName("messages-markup")[0];

        // Scroll down
        if (messagesContainer?.scrollHeight) messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Send message when user has got focus on input to pass new message content
        window.addEventListener("keypress", ({ code }) => {
            if (code == "Enter") sendNewMessage();
        });
    
        // Capture new messages from other "client" in room
        connection?.on("capture-new-message", (newMessage: typeof chat.messages[0]) => {
            chat.messages = [...chat.messages, newMessage];
            setTimeout(() => {
                // Scroll down
                if (messagesContainer?.scrollHeight) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            })
        });
    })
</script>

<div class="upper">
    <!-- Close chat element -->
    <button class="go-back" on:click={_ => dsp("hide-chat-messages")}>
        <Return size={24} fill="black"/>
    </button>
    <h1>Chat conversation ({chat.name.length ? chat.name : "No Name"})</h1>
    <button id="close-chat" on:click={_ => dsp("close-chat")}>
        <Close size={32} fill="white"/>
    </button>
</div>
<main class="messages">
    {#if adminOptionsHasBeenOpened}
        <div class="admin-options">
            <button id="terminate-case" on:click={onAdminTerminateCase}>Terminate Case</button>
            <button id="close" on:click={onOpenCloseAdminOptions}>Close</button>
        </div>
    {:else}
        {#if chat.messages.length}
            <div class="messages-markup">
                {#each chat.messages as message}
                    <div class="c" class:my={message.user_id == userId}>
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
    {/if}
    <div class="write-message" class:admin-mode={true}>
        {#if adminMode}
            <button class="admin-opt" on:click={onOpenCloseAdminOptions}>
                <IbmCloudHyperProtectCryptoServices size={24} fill="white"/>
            </button>
        {/if}
        <input type="text" placeholder="Message..." bind:value={messageChatContent} on:focus={focusMessageInput(true)} on:blur={focusMessageInput(false)}>
        <button class="send" title="send" on:click={sendNewMessage}>
            <SendFilled size={24} fill="white"/>
        </button>
    </div>
</main>

<style>
    button {
        border-radius: 0px;
        border: none;
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
        height: calc(100% - 80px);
        display: flex;
        justify-content: center;
        padding: 5px;
        color: grey;
    }

    main.messages .messages-markup {
        box-sizing: border-box;
        width: 100%;
        height: calc(100% - 80px);
        display: flex;
        flex-direction: column;
        row-gap: 2px;
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

    main.messages .write-message.admin-mode input {
        border-left: none;
        border-radius: 0%;
    }

    main.messages .write-message button {
        width: 5%;
        height: 52%;
        border: 1px grey solid;
        background-color: black;
        cursor: pointer;
    }

    button.send {
        border-left: none;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    button.admin-opt {
        border-right: none;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .upper {
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
        background-color: #EFEFEF;
    }

    .upper button.go-back:hover {
        background-color: rgb(35, 35, 35);
        filter: brightness(1.0);
        box-shadow: 0px 0px 10px rgb(85, 85, 85);
    }

    .admin-options {
        width: 100%;
        height: calc(100% - 80px);
        background-color: grey;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .admin-options button {
        width: 100%;
        height: 50px;
        border: solid 1px black;
        border-left: none;
        border-right: none;
        background-color: white;
        color: black;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .admin-options button#close {
        color: red;
    }
</style>
