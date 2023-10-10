import { Server } from "socket.io";
import { createServer } from "http";
import { randomUUID } from "crypto";
import type { PluginOption } from "vite";

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
