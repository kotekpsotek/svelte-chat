import type { Socket } from "socket.io-client";
import { writable } from "svelte/store";

export default writable<Socket | undefined>()