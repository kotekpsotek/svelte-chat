import { Server } from "socket.io";
import { createServer } from "http";
import { randomUUID } from "crypto";
import type { PluginOption } from "vite";

// Databases
import * as mongodb from "./databases/mogodb.js";

// Code main
function makeServer() {
    const http_server = createServer();
    const socket_server = new Server(http_server, {
        cors: {
            origin: "*",
            credentials: true
        }
    });
    
    socket_server.on("connect", (socket) => {
        socket.on("generate-my-id", (cb) => {
            cb(randomUUID());
        });

        socket.on("create-new-question", async (userId: string, title: string | undefined, firstMessageContent: string | undefined, cb) => {
            const chatId = randomUUID();

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

            cb(chatId, created.creation_date, title, created.messages);
        });
    })
    
    http_server.listen(10501)
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
        console.log("Svelte-Chat plugin is on work!");
    }
} as PluginOption
