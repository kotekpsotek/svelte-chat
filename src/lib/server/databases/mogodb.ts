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

/** Make connection and model for mongodb */
function makeConnectionAndModel() {
    const connection = mongoose.createConnection("mongodb://localhost:27017", {
        dbName: "svelte-chat",
    });
    const model = connection.model("svelte-chats", chatSchema, "sv-chats-collection");
    return { connection, model };
}

export const { model, connection } = makeConnectionAndModel()
export { chatSchema, type ChatSchema }
