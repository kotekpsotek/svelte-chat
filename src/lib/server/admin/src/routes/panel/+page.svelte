<script lang="ts">
    import { io } from "socket.io-client";
    
    const connection = io("http://localhost:10501", {
        withCredentials: true
    });

    interface AdminPreviewForChat {
        name: string,
        messages: any[],
        id: string,
        creation_date: Date
    }

    let chats: AdminPreviewForChat[] = [];
    async function goToChat() {
        connection.emit("get-admin-chats", (chatsPayload: AdminPreviewForChat[]) => {
            chats = chatsPayload;
        });
    }
</script>

<div>
    <div class="chats">
        <button id="chat" on:click={goToChat}>

        </button>
    </div>
</div>