<!-- When user is the admin and try to use normal chat what will be cause normally confusion in component behaviour -->
<!-- This will be initialized probably only dev mode (when admin app and default changes in swap way) -->
<script lang="ts">
    import Cookie from "js-cookie";
    import { createEventDispatcher } from "svelte";
    const dsp = createEventDispatcher();
    
    let secondsToAutomaticallyClose = 15;

    /** Logout admin */
    function logoutAdmin() {
        Cookie.get("sess") ? Cookie.remove("sess") : null;
        Cookie.get("user_id") && Cookie.get("user_id")?.includes("@") ? Cookie.remove("user_id") : null;
        dsp("terminated");
    }

    setInterval(() => {
        secondsToAutomaticallyClose -= 1;

        if (!secondsToAutomaticallyClose) {
            dsp("terminated");
        }
    }, 1_000);
</script>

<div class="back-grd">
    <button on:click={logoutAdmin}>
        <h2>Confussion point 🫦</h2>
        <p class="desc">
            You are login as admin and gona to use common app.
            Logout first by go to: <b>admin app logout page</b> or remove these two assigned to admin account cookies (<b><u>user_id</u> (with email)</b>, <b><u>sess</u> (when exists)</b>) by click on this element
        </p>
        <p class="happen">
            Click on or wait, Last: <span class="sp-last">{secondsToAutomaticallyClose}</span>
        </p>
    </button>
</div>

<style>
    .back-grd {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
    }

    button {
        width: 450px;
        padding: 15px;
        border: solid 1px black;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    p.desc {
        margin-top: 10px;
        width: 100%;
        text-align: start;
        font-size: 18px;
    }

    p.happen {
        margin-top: 15px;
        width: 100%;
        text-align: center;
        font-size: 20px;
    }

    span.sp-last {
        color: red;
    }
</style>
