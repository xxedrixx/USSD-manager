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
                <button class="m3-button cancel-btn" on:click={close}>
                    {$T.cancel || "Cancel"}
                </button>
                <button class="m3-button delete-btn" on:click={confirm}>
                    {$T.delete || "Delete"}
                </button>
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
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(4px);
    }

    .modal {
        background: var(--md-sys-color-surface);
        padding: 24px;
        border-radius: var(--radius-l);
        width: 90%;
        max-width: 320px;
        border: 1px solid var(--md-sys-color-outline);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes modal-pop {
        from {
            transform: scale(0.9) translateY(10px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    h2 {
        margin-bottom: 12px;
        color: var(--md-sys-color-primary);
        font-size: 1.25rem;
        font-weight: 700;
    }

    p {
        margin-bottom: 24px;
        color: var(--md-sys-color-on-surface-variant);
        line-height: 1.5;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .cancel-btn {
        background: transparent;
        color: var(--md-sys-color-primary);
        border: 1px solid var(--md-sys-color-outline-variant);
    }

    .delete-btn {
        background: #d32f2f;
        color: white;
        border: 1px solid var(--md-sys-color-outline-variant);
    }
</style>
