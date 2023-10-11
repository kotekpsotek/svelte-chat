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
            const chats = await mongodb.model.find({ user_creator: { $eq: userId } });
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
