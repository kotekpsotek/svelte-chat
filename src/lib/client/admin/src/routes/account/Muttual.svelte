<script lang="ts">
    import { page } from "$app/stores";
    const dt = $page.data;

    function stopPaste(ev: Event) {
        ev.preventDefault();
    }
</script>

<div>
    <form action="/" method="POST">
        <h1>{dt.for == "signin" ? "Signin" : "Signup"}</h1>
        {#if dt.for == "signin"}
            <input type="email" placeholder="Email" on:paste={stopPaste}>
            <input type="password" placeholder="Password" on:paste={stopPaste}>
        {:else if dt.for == "signup"}
            <input type="email" placeholder="Email" on:paste={stopPaste}/>
            <input type="password" placeholder="Password" on:paste={stopPaste}>
            <input type="password" placeholder="Password" on:paste={stopPaste}/>
        {/if}
        <button type="submit">Submit</button>
    </form>
</div>

<style>
    div {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 450px;
        padding: 10px;
        border: solid 1px black;
        border-radius: 5px;
    }
</style>
