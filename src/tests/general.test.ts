import { it, describe, expect } from "vitest";
import { readConfig } from "../lib/server/as-plugin.js";

describe("Server side testing", () => {
    it("Parse JSON config from Desktop ENV", readConfig);
    it("Parsed JSON ENV config has got required fields", () => {
        const exp = expect(readConfig());
        exp.toHaveProperty("server.port")
        exp.toHaveProperty("admin_server.port");
    })
})
