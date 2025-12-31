<script>
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";

    export let isOpen = false;
    export let editMode = false;
    export let codeData = {
        title: "",
        code: "",
    };

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    function handleKeydown(e) {
        if (e.key === "Escape") close();
    }

    function save() {
        if (!codeData.title || !codeData.code) return;
        dispatch("save", codeData);
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
        class="modal-backdrop"
        on:click={close}
        role="dialog"
        tabindex="-1"
        on:keydown={(e) => {
            if (e.key === "Escape") close();
        }}
    >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="modal" on:click|stopPropagation role="document">
            <h2>{editMode ? $T.edit_code : $T.add_code}</h2>

            <div class="form-group">
                <label for="title">{$T.title}</label>
                <input
                    id="title"
                    type="text"
                    bind:value={codeData.title}
                    placeholder={$T.title}
                />
            </div>

            <div class="form-group">
                <label for="code">{$T.ussd_code}</label>
                <input
                    id="code"
                    type="tel"
                    bind:value={codeData.code}
                    placeholder="e.g. *123#"
                />
            </div>

            <div class="actions">
                <button class="cancel-btn" on:click={close}>{$T.cancel}</button>
                <button class="save-btn" on:click={save}>{$T.save}</button>
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
        margin-bottom: 20px;
        color: var(--primary-color);
    }

    .form-group {
        margin-bottom: 16px;
    }

    label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: #666;
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
        margin-top: 24px;
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
