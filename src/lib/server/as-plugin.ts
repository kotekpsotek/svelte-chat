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
 * @description Read config from Desktop ENV
*/
export function readConfig(): ChatPluginConfig {
    const env = process.env["SVELTE_CHAT"];

    if (env) {
        try {
            const pEnv: ChatPluginConfig = JSON.parse(env);
            
            // When required config options aren't in config
            if (!pEnv.admin_server?.port || !pEnv.server?.port) {
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
    else throw Error("You didn't setted-up 'SVELTE_CHAT' environment variable (ENV with config). Check docs for more details");
}

/** 
 * @description Direct way to attach svelte-chat plugin for your application 
 * @param config - configuration for all app dimensions
*/
export function chatPlugin(config: ChatPluginConfig = { server: { port: 10501 }, admin_server: { port: 10502 } }, verbose: boolean = false) {
    return {
        name: "svelte-chat-plugin",
        configureServer(server) {
            makeServer(config?.server);
            // TODO: 'makeAdminPanelRouting' function should be executed as separate application in order to allow for pass ENV's which can be read into '@sveltejs/adapter-node' app. This can be done via "node.js" "child_process" module, e.g: child_process.spawn("ORIGIN="" node file.js") (Requirement full: file.js file should be known on desktoip )
            // makeAdminPanelRouting(config);
            if (verbose) console.log("Svelte-Chat plugin is on work!");
        }
    } as PluginOption
}
