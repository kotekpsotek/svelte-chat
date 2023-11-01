export interface ClientOptions {
    /** Should match up to responsible same named plugin option field with identical rule (should have same data as **svelteChatPlugin** ***config["server"]*** property */
    server?: {
        port: number
    }
}
