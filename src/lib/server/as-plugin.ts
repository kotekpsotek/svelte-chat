import type { ClientOptions } from "$lib/client/client.typing.js";
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
 * @description Read config from Desktop ENV or when doesn't exists return undefined
*/
export function readConfig(): ChatPluginConfig | undefined {
    const env = process.env["SVELTE_CHAT"];

    if (env) {
        try {
            const pEnv: ChatPluginConfig = JSON.parse(env);
            
            // When required config options aren't in config
            if ((pEnv.admin_server && !pEnv.admin_server.port) || (pEnv.server && !pEnv.server.port)) {
                const fieldState = (field: any) => {
                    return field ? "EXISTS" : "DOESN't EXISTS"
                }
                throw new Error(`Required ENV oprtions wasn't setted-up. ENV State:\n\t"admin_server.port": ${fieldState(pEnv.admin_server?.port)}\n\t"server.port": ${fieldState(pEnv.server?.port)}`);
            }

            // Return 'ChatPluginConfig'
            return pEnv;
        }
        catch(err) {
            switch ((err as Error)?.name) {
                case "SyntaxError":
                    throw new Error("Under ENV 'SVELTE_CHAT' is incorrect JSON content");

                default:
                    throw new Error(`Error occurs:\n` + err)
            }
        }
    }

    return;
    // else throw Error("You didn't setted-up 'SVELTE_CHAT' environment variable (ENV with config). Check docs for more details");
}

/** 
 * @description Load settings for client side from **Environment Variables** when exists in another case serves default options. Should be use as server load function e.g: '+layout.server.ts' or in other '+page.server.ts' and in both, in such way: ```export const load = loadLayoutServer```
*/
export function loadLayoutServer() {
    const options = readConfig();

    return {
        server: {
            port: options?.server?.port || 10501
        } 
    } satisfies ClientOptions;
}

/** 
 * @description Other named Alias for '**loadLayoutServer**' function 
*/
export function load() {
    return loadLayoutServer();
}

/** 
 * @description Direct way to attach svelte-chat plugin for your application 
 * @param config - configuration for all app dimensions
*/
export function chatPlugin(verbose: boolean = false) {
    return {
        name: "svelte-chat-plugin",
        configureServer(server) {
            makeServer();
            // TODO:
            makeAdminPanelRouting();
            if (verbose) console.log("Svelte-Chat plugin is on work!");
        }
    } as PluginOption
}
