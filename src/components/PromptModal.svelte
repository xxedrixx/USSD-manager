<script>
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";

    export let isOpen = false;
    export let title = "";
    export let message = "";
    export let placeholder = "";
    export let value = "";

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    function confirm() {
        if (!value) return;
        dispatch("confirm", value);
        value = ""; // Reset
    }

    function handleKeydown(e) {
        if (e.key === "Escape") close();
        if (e.key === "Enter") confirm();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="modal-backdrop" on:click={close} role="dialog" tabindex="-1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="modal" on:click|stopPropagation role="document">
            <h2>{title}</h2>
            {#if message}<p>{message}</p>{/if}

            <div class="form-group">
                <input type="text" bind:value {placeholder} />
            </div>

            <div class="actions">
                <button class="cancel-btn" on:click={close}
                    >{$T.cancel || "Cancel"}</button
                >
                <button class="save-btn" on:click={confirm}
                    >{$T.save || "OK"}</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        background: var(--surface-color);
        padding: 24px;
        border-radius: var(--radius);
        width: 90%;
        max-width: 400px;
        box-shadow: var(--elevation-2);
    }

    h2 {
        margin-bottom: 12px;
        color: var(--primary-color);
        font-size: 1.25rem;
    }

    p {
        margin-bottom: 16px;
        color: #666;
    }

    .form-group {
        margin-bottom: 24px;
    }

    input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        background: var(--background-color);
        color: var(--on-surface);
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }

    button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
    }

    .cancel-btn {
        background: transparent;
        color: #666;
    }

    .save-btn {
        background: var(--primary-color);
        color: var(--on-primary);
    }
</style>
