<script>
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";

    export let isOpen = false;
    export let title = "";
    export let message = "";

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    function confirm() {
        dispatch("confirm");
        close();
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
            <p>{message}</p>

            <div class="actions">
                <button class="cancel-btn" on:click={close}
                    >{$T.cancel || "Cancel"}</button
                >
                <button class="delete-btn" on:click={confirm}
                    >{$T.delete || "Delete"}</button
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
        margin-bottom: 24px;
        color: #666;
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

    .delete-btn {
        background: #d32f2f; /* Red */
        color: white;
    }
</style>
