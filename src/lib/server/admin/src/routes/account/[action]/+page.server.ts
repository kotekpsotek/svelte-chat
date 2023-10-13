import crypto from "crypto";
import * as mongodb from "../../../../../databases/mogodb";
import * as session from "$lib/session";

export const load = ({ locals, params }) => {
    return {
        for: params.action == "signin" ? "signin" : "signup"
    }
}

function passwordToCheckByHash(password: string) {
    const hashFunct = crypto.createHash("shake256");
    hashFunct.update(password, "utf-8");
    return hashFunct.digest("hex");
}

export const actions = {
    signin: async ({ request, cookies, locals }) => {
        let statusAction = false;
        
        const data = await request.formData();
        const [email, password] = [data.get("email") as string, data.get("password") as string];
        
        // Conditions
        const userExistsWithAllParams = await mongodb.modelAdmin.exists({ email, password: passwordToCheckByHash(password) });

        if (userExistsWithAllParams) {
            statusAction = true;
            
            // Set login session cookie (for server and client)
            new session.SessionWrite(cookies, locals);
        }

        return { action: "signin", success: statusAction };
    },
    signup: async ({ request }) => {
        let statusAction = false;

        const data = await request.formData();
        const [name, email, password] = [data.get("name") as string, data.get("email") as string, data.get("password") as string];
    
        // Conditions
        const passCond = password?.length >= 8 && password?.length <= 20 && password.match(/\d/gi)?.length && password.match(/[A-Z]/g)?.length && password.match(/[a-z]/g)?.length && password.match(/\W/g)?.length ? true : false;
        const emailCond = await (async function() {
            const emailExists = await mongodb.modelAuthAdmin.findOne({ email: { $eq: email } });
            return emailExists != null && email == emailExists.email;
        })();

        if (passCond && emailCond) {
            statusAction = true;

            // Save new admin account in MongoDB
            const obj: mongodb.AdminSchema = {
                name,
                email,
                password: passwordToCheckByHash(password) 
            };
            await mongodb.modelAdmin.create(obj);
        }

        return { action: "signup", success: statusAction };
    }
}
