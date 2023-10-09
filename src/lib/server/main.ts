import { Server } from "socket.io";
import { createServer } from "http";
import { randomUUID } from "crypto";

export class ServerChatHandler {
    constructor() {
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
}
