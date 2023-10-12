import crypto from "crypto";

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
    signin: async ({ request }) => {
        let statusAction = false;
        
        const data = await request.formData();
        const [email, password] = [data.get("email") as string, data.get("password") as string];
        
        // Conditions
        const passwordToCheckExistance = passwordToCheckByHash(password); // TODO: use it
        const userExistsWithAllParams = true; // TODO: Check whether user exists in database

        if (userExistsWithAllParams) {
            statusAction = true;
            // TODO: Set login session cookie
        }

        return { action: "signin", success: statusAction };
    },
    signup: async ({ request }) => {
        let statusAction = false;

        const data = await request.formData();
        const [email, password]: [string, string] = [data.get("email") as any, data.get("password") as any];
    
        // Conditions
        const passCond = password?.length >= 8 && password?.length <= 20 && password.match(/\d/gi)?.length && password.match(/[A-Z]/g)?.length && password.match(/a-z/g)?.length && password.match(/\W/g)?.length;
        const emailCond = true; // TODO:

        if (passCond && emailCond) {
            statusAction = true;
            // TODO: Save new admin account
        }

        return { action: "signup", success: statusAction };
    }
}
