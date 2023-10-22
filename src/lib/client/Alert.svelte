<script lang="ts">
    import { onMount } from "svelte";
    import { InformationFilled, CheckmarkFilled, Misuse } from "carbon-icons-svelte";
    
    export let type: "info" | "error" | "success"
    export let message: string;
    export let temporaryMs: number | undefined = undefined;

    type AlertElement = HTMLDivElement;

    let alertElement: AlertElement;

    function alertTitle() {
        switch(type) {
            case "info":
                return "Information";
            case "success":
                return "Success";
            case "error":
                return "Error";
            default:
                return "not specified (to do)"
        }
    }

    onMount(() => {
        if (temporaryMs) {
            setTimeout(() => {
                alertElement.remove();
            }, temporaryMs)
        }
    });
</script>

<div class="alert" class:info={type == "info"} class:error={type == "error"} class:success={type == "success"} bind:this={alertElement}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="ico" on:click={_ => alertElement.remove()}>
        {#if type == "info"}
            <InformationFilled size={25} fill={type == "info" ? "lightblue" : "black"}/>
        {:else if type == "success"}
            <CheckmarkFilled size={25} fill="black"/>
        {:else if type == "error"}
            <Misuse size={25} fill="black"/>
        {/if}
    </div>
    <div class="txt">
        <h2>{alertTitle()}</h2>
        <div class="message-cnt">
            <p>{message}</p>
        </div>
    </div>
</div>

<style>
    .alert {
        position: absolute;
        top: 10px;
        right: 20px;
        width: 350px;
        height: 125px;
        display: flex;
        background-color: white;
        border: solid 1px black;
        column-gap: 5px;
    }

    .ico {
        width: 30%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer !important;
    }

    .ico:hover {
        filter: brightness(1.2);
    }

    .txt {
        width: 70%;
        height: 100%;
        text-align: start;
        display: flex;
        flex-direction: column;
        row-gap: 2px;
        padding: 2px;
    }

    .message-cnt {
        width: 100%;
        overflow-y: auto;
    }

    .message-cnt::-webkit-scrollbar {
        background-color: whitesmoke;
        width: 5px;
    }

    .message-cnt::-webkit-scrollbar-thumb {
        background-color: black;
        border-radius: 5px;
    }

    /* Specific rules */
    .alert.info {
        border-color: lightblue;
    }

    .alert.error {
        border-color: rgb(193, 81, 81);
    }

    .alert.success {
        border-color: rgb(36, 183, 36);
    }

    .alert.info .ico {
        background-color: rgb(63, 162, 161);
    }

    .alert.error .ico {
        background-color: rgb(157, 16, 16);
    }

    .alert.success .ico {
        background-color: rgb(19, 168, 19);
    }

    .alert.info h2 {
        color: lightblue;
    }

    .alert.error h2 {
        color: rgb(193, 81, 81);
    }

    .alert.success h2 {
        color: rgb(36, 183, 36);
    }
</style>
