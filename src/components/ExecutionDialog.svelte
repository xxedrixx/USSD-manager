<script>
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";

    export let isOpen = false;
    export let code = "";

    const dispatch = createEventDispatcher();

    let variables = [];
    let values = {};

    $: {
        if (code) {
            const matches = code.match(/\{([^}]+)\}/g);
            if (matches) {
                variables = matches.map((m) => m.slice(1, -1));
                variables.forEach((v) => {
                    if (!values[v]) values[v] = "";
                });
            } else {
                variables = [];
            }
        }
    }

    function close() {
        dispatch("close");
    }

    function execute() {
        let finalCode = code;
        for (const v of variables) {
            if (!values[v]) return;
            finalCode = finalCode.replace(`{${v}}`, values[v]);
        }
        dispatch("execute", finalCode);
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        on:click={close}
        role="button"
        tabindex="0"
        on:keydown={(e) => {
            if (e.key === "Enter" || e.key === " ") close();
        }}
    >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="m3-card glass modal"
            on:click|stopPropagation
            role="document"
        >
            <h2>{$T.enter_details || "Enter Details"}</h2>
            <p class="preview">{code}</p>

            {#each variables as v}
                <div class="form-group">
                    <label for={v}>{v}</label>
                    <input
                        id={v}
                        type={v.toLowerCase().includes("phone")
                            ? "tel"
                            : "text"}
                        bind:value={values[v]}
                    />
                </div>
            {/each}

            <div class="actions">
                <button class="m3-button m3-button-secondary" on:click={close}
                    >{$T.cancel || "Cancel"}</button
                >
                <button class="m3-button m3-button-primary" on:click={execute}
                    >{$T.dial || "Dial"}</button
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
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(4px);
    }

    .modal {
        width: 90%;
        max-width: 400px;
        padding: 24px;
        border-radius: var(--radius-xl) !important;
    }

    h2 {
        margin-bottom: 12px;
        font-size: 1.5rem;
        color: var(--md-sys-color-on-surface);
    }

    .preview {
        font-family: monospace;
        background: var(--md-sys-color-surface-variant);
        padding: 12px;
        border-radius: var(--radius-m);
        margin-bottom: 24px;
        word-break: break-all;
        color: var(--md-sys-color-on-surface-variant);
        font-size: 0.9rem;
    }

    .form-group {
        margin-bottom: 16px;
    }

    label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface-variant);
        text-transform: capitalize;
    }

    input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--radius-m);
        font-size: 1rem;
        background: var(--md-sys-color-background);
        color: var(--md-sys-color-on-surface);
        outline: none;
    }

    input:focus {
        border-color: var(--md-sys-color-primary);
        border-width: 2px;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 32px;
    }

    .m3-button {
        padding: 10px 24px;
        font-size: 0.9rem;
    }
</style>
