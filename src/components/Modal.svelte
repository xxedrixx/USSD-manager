<script>
    import { createEventDispatcher } from "svelte";

    export let open = false;
    export let labelledby = undefined;
    export let maxWidth = 400;

    const dispatch = createEventDispatcher();

    function handleKeydown(e) {
        if (open && e.key === "Escape") dispatch("close");
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" on:click|self={() => dispatch("close")}>
        <div
            class="modal glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledby}
            style="max-width: {maxWidth}px"
        >
            <slot />
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(4px);
        padding: 16px;
    }

    .modal {
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
        padding: 24px;
        border-radius: var(--radius-xl);
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        border: 1px solid var(--md-sys-color-outline-variant);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: modal-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes modal-pop {
        from {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
</style>
