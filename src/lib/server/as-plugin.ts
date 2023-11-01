import { makeAdminPanelRouting, makeServer } from "./main.js";
import type { PluginOption } from "vite";

/** Config specification for svelte-chat plugin initialization call-unit */
export interface ChatPluginConfig {
    /** Server side handling options for all tasks */
    server?: {
        port: number
    },
    /** Server side handling options for admin tasks */
    admin_server?: {
        port: number
    }
}

/** 
 * @description Direct way to attach svelte-chat plugin for your application 
 * @param config - configuration for all app dimensions
*/
export function chatPlugin(config?: ChatPluginConfig, verbose: boolean = false) {
    return {
        name: "svelte-chat-plugin",
        configureServer(server) {
            makeServer(config?.server);
            makeAdminPanelRouting(config?.admin_server);
            if (verbose) console.log("Svelte-Chat plugin is on work!");
        }
    } as PluginOption
}
