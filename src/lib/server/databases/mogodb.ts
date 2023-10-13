import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

interface ChatSchema {
    id: string,
    name?: string,
    messages: {
        content: string
        user_id: string,
        date: Date // Date can be also uuid
    }[],
    creation_date: Date,
    user_creator: string
}

const chatSchema = new Schema<ChatSchema>({
    id: { type: String, default: () => randomUUID() },
    name: { type: String },
    messages: { type: [Object], default: [] },
    creation_date: { 
        type: Date, 
        default: () => {
            return Date.now();
        }
    },
    user_creator: { type: String, required: true }
});

interface AdminSchema {
    name: string,
    email: string,
    password: string,
    creation_date: Date
}

const adminSchema = new Schema<AdminSchema>({
    name: String,
    email: String,
    password: String,
    creation_date: { type: Date, default: () => new Date() }
})

/** Make connection and model for mongodb */
function makeConnectionAndModel() {
    const connection = mongoose.createConnection("mongodb://localhost:27017", {
        dbName: "svelte-chat",
    });
    const modelChats = connection.model("svelte-chats", chatSchema, "sv-chats-collection");
    const modelAdmin = connection.model("admin", adminSchema);

    return { connection, model: modelChats, modelAdmin };
}

export const { model, connection } = makeConnectionAndModel()
export { chatSchema, type ChatSchema }
