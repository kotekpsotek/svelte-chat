<script lang="ts">
    export let caseTitle: string = "";
    export let firstQuestionContent: string = "";

    import { createEventDispatcher } from "svelte";
    const dsp = createEventDispatcher();
</script>

<svelte:options accessors="{true}"/>

<section>
    <main>
        <h1>Pass additional chat options</h1>
        <input type="text" placeholder="Case title" bind:value={caseTitle}>
        <input type="text" placeholder="* First question content" bind:value={firstQuestionContent}> 
        <div>
            <button id="skip" on:click={
                _ => dsp("skip")                
            }>
                Skip
            </button>
            <button id="confirm" on:click={
                _ => dsp("confirm")
            }>
                Confirm
            </button>
        </div>
    </main>
</section>

<style>
    * {
        font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-sizing: border-box;
    }
    
    section {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0px;
        right: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 200;
    }

    main {
        width: 450px;
        padding: 10px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        background-color: whitesmoke;
    }

    main > div {
        display: flex;
        justify-content: flex-end;
        gap: 3px;
    }

    main input {
        width: 100%;
        height: 40px;
        font-size: 18px;
        border: solid 1px black;
        border-radius: 5px;
        padding-left: 5px;
        padding-right: 5px;
        color: black;
    }

    main input::placeholder {
        color: black;
    }

    main > div button {
        padding: 5px;
        border-radius: 5px;
        text-transform: uppercase;
        font-size: 18px;
        font-weight: 600;
        outline: none;
        border: none;
        cursor: pointer;
    }

    button#confirm {
        background-color: black;
        color: white;
    }

    button#skip {
        border: black solid 1px;
        color: black;
        background-color: transparent;
    }
</style>
