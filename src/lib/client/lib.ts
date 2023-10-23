import Cookie from "js-cookie";

/* Set id cookie for websocket server */
export default function setIdCookie(uuid: string) {
    Cookie.set("user_id", uuid);
}
