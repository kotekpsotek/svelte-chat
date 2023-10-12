export const load = ({ url }) => {
    return {
        for: url.pathname.includes("signin") ? "signin" : "signup"
    }
}
