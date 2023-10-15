
import { Server } from "socket.io";
import { createServer } from "http";
import { randomUUID } from "crypto";
import type { PluginOption, ViteDevServer } from "vite";
import express from "express";

// Setup SvelteKit Admin app Handler for production
process.env["ORIGIN"] = "http://localhost:10502";
import { handler as svelteKitAdminApp } from "./admin/build/handler.js";

// Databases
import * as mongodb from "./databases/mogodb.js";

// Code main
function makeServer() {
    const http_server = createServer();
    const socket_server = new Server(http_server, {
        cors: {
            origin: "http://localhost:5555",
            credentials: true
        }
    });

    /** @description Check admin is admin for **admin actions** */
    socket_server.use(async (socket, nxt) => {
        // Parse cookie
        function parseCookie() {
            const ready = new Map<string, string>();

            if (socket.request.headers.cookie) {
                const differentCookies = socket.request.headers.cookie.split(";");
                for (const cookie of differentCookies) {
                    const [name, val] = cookie.split("=");
                    ready.set(name, val);
                }
            }

            return ready;
        }

        // Cookies
        const cookies = parseCookie();
        const sessCookie = cookies.get("sess");

        // Check user admin is realy admin
        if (sessCookie) {
            // Check in database
            if (await mongodb.modelAuthAdmin.exists({ sess_id: { $eq: sessCookie }, date_set: { $gt: new Date() } })) {
                socket.data.isRealAdmin = true;
            }
        }

        nxt();
    })
    
    socket_server.on("connect", (socket) => {
        const conditionInteractionWithChat = (chatId: string, userId: string) => {
            return { $and: [{ id: { $eq: chatId } }, { $or: [{ user_creator: { $eq: userId } }, { "messages.user_id": { $eq: userId } }]}] }
        };
        
        socket.on("generate-my-id", (cb) => {
            cb(randomUUID());
        });

        socket.on("create-new-question", async (userId: string, title: string | undefined, firstMessageContent: string | undefined, cb) => {
            // Create new chat in mongodb storage
            const created = await mongodb.model.create({
                name: title,
                messages: firstMessageContent ? [
                    {
                        content: firstMessageContent,
                        user_id: userId,
                        date: new Date()
                    }
                ]
                :
                undefined,
                user_creator: userId
            });

            // Join user to chat room (by chat id)
            socket.join(created.id);

            cb(created.id, created.creation_date, title, created.messages);
        });

        socket.on("get-chats", async (userId: string, cb) => {
            const chats = await mongodb.model.find({ user_creator: { $eq: userId } })
                .sort({ creation_date: "desc" });
            cb(chats)
        });

        socket.on("join-to-chat", async (chatId: string, userId: string) => {
            if (await mongodb.model.exists({ ...conditionInteractionWithChat(chatId, userId), $comment: "Check whether user is in chat (specified by chat ID) before join hsi present to this chat room" })) {
                socket.join(chatId);
            }
        });

        socket.on("leave-chat", (chatId: string) => {
            if (socket.rooms.has(chatId)) {
                socket.leave(chatId);
            }
        });

        socket.on("new-message", async (userId: string, chatId: string, messageContent: string, cb: (success: boolean, message: Record<string, any> | undefined) => void) => {
            try {
                if (await mongodb.model.exists({ ...conditionInteractionWithChat(chatId, userId), $comment: "Check whether user is in chat (specified by chat ID) before add his message to it" })) {
                    // Compose new message
                    const new_message: mongodb.ChatSchema["messages"][0] = {
                        user_id: userId,
                        content: messageContent,
                        date: new Date()
                    };
    
                    // Pass new message to database
                    const updated = await mongodb.model.findOneAndUpdate(conditionInteractionWithChat(chatId, userId), {
                        $push: {
                            messages: new_message
                        }
                    }, { new: true });

                    // Send new message attention to other "client" in room
                    socket.in(chatId)
                        .emit("capture-new-message", new_message);

                    // Send to client success result
                    cb(true, new_message)
                }
                else cb(false, undefined);
            }
            catch(err) {
                cb(false, undefined)
            }
        });
    })
    
    http_server.listen(10501)
}

// 
const PORT_ADMIN = 10502;
/**
 * @summary To Run SvelteKit Admin app you should put environment required variables (full list below) before run command so like this: ORIGIN="SvelteKitAdminAppRoute e.g: http://localhost:10502" npm run dev. In Windows this is only possible throught WSL or any Bash shell 
 * @description Required Environment variables: ORIGIN="Origin where your SvelteKit admin app occurs"
*/
function makeAdminPanelRouting() {
    const app = express();

    // Let sveltekit application work
    app.use(svelteKitAdminApp);

    // Listen addmin app on specified port
    app.listen(PORT_ADMIN);
}

export class ServerChatHandler {
    constructor() {
        makeServer()
    }
}

export const svelteChatPlugin = {
    name: "svelte-chat-plugin",
    configureServer(server) {
        makeServer();
        makeAdminPanelRouting();
        console.log("Svelte-Chat plugin is on work!");
    }
} as PluginOption
