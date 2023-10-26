
import { Server } from "socket.io";
import { createServer } from "http";
import { randomUUID } from "crypto";
import type { PluginOption, ViteDevServer } from "vite";
import express from "express";

// Setup SvelteKit Admin app Handler for production
process.env["ORIGIN"] = "http://localhost:10502";
// import { handler as svelteKitAdminApp } from "./admin/build/handler.js";

// Databases
import * as mongodb from "./databases/mogodb.js";
import type { Socket } from "socket.io-client";

// Code main
function makeServer() {
    const http_server = createServer();
    const socket_server = new Server(http_server, {
        cors: {
            origin: ["http://localhost:5555", "http://localhost:10502", "http://localhost:5173", "http://localhost:5174"],
            credentials: true
        }
    });

    // Parse cookie
    function parseCookie(socket: any) {
        const ready = new Map<string, string>();

        if (socket.request.headers.cookie) {
            const differentCookies = socket.request.headers.cookie.split(";");
            for (const cookie of differentCookies) {
                const [name, val] = cookie.split("=");
                ready.set(name.trim(), val);
            }
        }

        return ready;
    }

    /** @description Check admin is admin for **admin actions** and setup user IDENTIFIER */
    socket_server.use(async (socket, nxt) => {
        // Cookies
        const cookies = parseCookie(socket);
        const sessCookie = cookies.get("sess");

        // Set user id
        socket.data.uuid = cookies.get("user_id");
        socket.join(socket.data.uuid);

        // Check user admin is realy admin
        if (sessCookie) {
            // Check in database
            const sesCookie = await mongodb.sessionAdminCookiesModel.findOne({ sess_id: { $eq: sessCookie }, expiration_date: { $gt: new Date() } })
            if (sesCookie) {
                socket.data.isRealAdmin = true;
                socket.data.admin_email = sesCookie.email;

                // Join admin to admin room
                if (socket.data.isRealAdmin) {
                    socket.join("admin-room");
                }
            }
        }

        nxt();
    });
    
    socket_server.on("connect", (socket) => {
        const conditionInteractionWithChat = (chatId: string, userId: string) => {
            return { $and: [{ id: { $eq: chatId } }, { $or: [{ user_creator: { $eq: userId } }, { "messages.user_id": { $eq: userId } }]}] }
        }
        
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

            // Send feedback to client
            cb(created.id, created.creation_date, title, created.messages);

            // Emit to admin event that new chat has been made
            delete (created as any)._id;
            delete created.__v;
            socket.in("admin-room").emit("admin-new-chat-arrived", created);
        });

        socket.on("get-chats", async (userId: string, cb) => {
            /* const chats = await mongodb.model.find({ user_creator: { $eq: userId } })
                .sort({ creation_date: "desc" });
            cb(chats) */
            const chats = await mongodb.model.aggregate([
                { $match: { user_creator: { $eq: userId } } },
                { $sort: { creation_date: -1 } },
                { 
                    $set: { 
                        new_messages: {
                            $size: {
                                $filter: {
                                    input: "$messages",
                                    as: "message",
                                    cond: {
                                        $and: [
                                            { $ne: ["$$message.user_id", userId] },
                                            { $gt: ["$$message.date", "$$ROOT.activities.user_creator"] }
                                        ]
                                    }
                                }
                            }
                        } 
                    } 
                },
                { $project: { _id: false } }
            ]);
            cb(chats);
        });

        socket.on("join-to-chat", async (chatId: string, userId: string) => {
            if (socket.data.isRealAdmin || await mongodb.model.exists({ ...conditionInteractionWithChat(chatId, userId), $comment: "Check whether user is in chat (specified by chat ID) before join hsi present to this chat room" })) {
                socket.join(chatId); // Join to chat id
                socket.join(userId); // Gather in user creator room
            }
        });

        socket.on("leave-chat", async (chatId: string) => {
            if (socket.rooms.has(chatId)) {
                // Leave room
                socket.leave(chatId);

                // Update last user activity
                if (!socket.data.isRealAdmin) {
                    await mongodb.model.findOneAndUpdate(
                        { id: chatId }, 
                        { activities: { user_creator: new Date() } }
                    );
                }
            }
        });

        socket.on("new-message", async (userId: string, chatId: string, messageContent: string, cb: (success: boolean, message: Record<string, any> | undefined) => void) => {
            try {
                if (socket.data.isRealAdmin || await mongodb.model.exists({ ...conditionInteractionWithChat(chatId, userId), $comment: "Check whether user is in chat (specified by chat ID) before add his message to it" })) {
                    // Compose new message
                    const new_message: mongodb.ChatSchema["messages"][0] = {
                        user_id: !socket.data.isRealAdmin ? userId : socket.data.admin_email,
                        content: messageContent,
                        date: new Date()
                    };
    
                    // Pass new message to database
                    const updated = await mongodb.model.findOneAndUpdate(socket.data.isRealAdmin ? { id: chatId } : conditionInteractionWithChat(chatId, userId), {
                        $push: {
                            messages: new_message
                        }
                    }, { new: true });

                    // Send new message attention to other "client" in room
                    socket.in(chatId)
                        .emit("capture-new-message", new_message);

                    // Send message to message creator when admin respond
                    if (socket.data.isRealAdmin) {
                        socket.in(updated!.user_creator)
                            .emit("admin-sent-response", chatId);
                    }

                    // Send to client success result
                    cb(true, new_message)
                }
                else cb(false, undefined);
            }
            catch(err) {
                cb(false, undefined)
            }
        });
        
        socket.on("get-admin-chats", async (cb: (success: boolean, chat: { name: string, messages: { content: string, user_id: string, date: Date }[], id: string, creation_date: string }[]) => void) => {
            if (socket.data.isRealAdmin) {
                const chatsFind = await mongodb.model.aggregate([
                    { $match: { id: { $exists: true } } },
                    { $project: { _id: false, name: "$name", messages: "$messages", id: "$id", creation_date: "$creation_date" } },
                    { $sort: { creation_date: -1 } }
                ]) || [];
                cb(true, chatsFind);
            }
            else cb(false, [])
        });

        socket.on("admin-join-to-chat", (chat_id: string, cb: (success: boolean) => void) => {
            if (socket.data.isRealAdmin) {
                socket.join(chat_id);
                cb(true);
            }
            else cb(false);
        });

        socket.on("admin-get-email", (cb: (email: string | undefined) => void) => {
            let email: string | undefined = undefined;
            if (socket.data.isRealAdmin) {
                email = socket.data.admin_email;
            }
            cb(email);
        });

        socket.on("terminate-chat", async (chatId: string, cb: (success: boolean) => void) => {
            if (socket.data.isRealAdmin) {
                const chatDeleted = await mongodb.model.findOneAndDelete({ id: { $eq: chatId } });

                if (chatDeleted) {
                    cb(true);

                    // Emit to other user which made terminated case
                    socket
                        .in(chatId)
                        .emit("chat-terminated-by-admin", chatId);

                    // Emit to other socket that chat has been terminated when user is not in room
                    const otherSocketId = chatDeleted.user_creator;
                    socket
                        .in(otherSocketId)
                        .emit("chat-deleted-by-admin-when-you-out-of-room", chatId)

                    // Emit to other admins whose aren't in deleted room that room has been deleted
                    socket
                        .in("admin-room")
                        .emit("other-admin-terminate-room", chatId, socket.data.admin_email);
                }
                else cb(false)
            }
            else cb(false);
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
    // app.use(svelteKitAdminApp);

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
