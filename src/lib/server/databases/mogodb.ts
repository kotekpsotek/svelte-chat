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
});

interface AuthAdminsEmailsSchema {
    email: string
}

const authAdminSchema = new Schema<AuthAdminsEmailsSchema>({
    email: { type: String, required: true }
});

/** Make connection and model for mongodb */
function makeConnectionAndModel() {
    const connection = mongoose.createConnection("mongodb://localhost:27017", {
        dbName: "svelte-chat",
    });
    const modelChats = connection.model("svelte-chats", chatSchema, "sv-chats-collection");
    const modelAdmin = connection.model("admin", adminSchema);
    const modelAuthAdmin = connection.model("admin_auth", authAdminSchema);

    return { connection, model: modelChats, modelAdmin, modelAuthAdmin };
}

export const { model, connection, modelAdmin, modelAuthAdmin } = makeConnectionAndModel()
export { chatSchema, adminSchema, authAdminSchema };
export type { ChatSchema, AdminSchema, AuthAdminsEmailsSchema };
