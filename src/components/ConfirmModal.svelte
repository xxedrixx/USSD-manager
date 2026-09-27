<script>
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";
    import Modal from "./Modal.svelte";

    export let isOpen = false;
    export let title = "";
    export let message = "";

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    function confirm() {
        dispatch("confirm");
    }
</script>

<Modal open={isOpen} labelledby="confirm-title" maxWidth={320} on:close={close}>
    <h2 id="confirm-title">{title}</h2>
    <p>{message}</p>

    <div class="actions">
        <button class="m3-button cancel-btn" on:click={close}>
            {$T.cancel || "Cancel"}
        </button>
        <button class="m3-button delete-btn" on:click={confirm}>
            {$T.delete || "Delete"}
        </button>
    </div>
</Modal>

<style>
    h2 {
        margin-bottom: 12px;
        color: var(--md-sys-color-primary);
        font-size: 1.25rem;
        font-weight: 700;
    }

    p {
        margin: 0 0 24px;
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
