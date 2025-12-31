<script>
    import { createEventDispatcher } from "svelte";
    import { Contacts } from "@capacitor-community/contacts";
    import { Capacitor } from "@capacitor/core";

    export let isOpen = false;
    export let code = "";

    const dispatch = createEventDispatcher();

    let variables = [];
    let values = {};

    // Parse code for variables like {phone} or {amount}
    $: {
        if (code) {
            const matches = code.match(/\{([^}]+)\}/g);
            if (matches) {
                variables = matches.map((m) => m.slice(1, -1));
                // Initialize values
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
            if (!values[v]) {
                // Validation could go here
                return;
            }
            finalCode = finalCode.replace(`{${v}}`, values[v]);
        }
        dispatch("execute", finalCode);
    }

    async function pickContact(variable) {
        if (!Capacitor.isNativePlatform()) {
            alert("Contact picker only works on native device");
            return;
        }

        try {
            const result = await Contacts.pickContact({
                projection: {
                    name: true,
                    phones: true,
                },
            });

            if (
                result &&
                result.contact &&
                result.contact.phones &&
                result.contact.phones.length > 0
            ) {
                // Simple logic: take first number, strip non-digits
                let number = result.contact.phones[0].number;
                // Basic cleaning
                // number = number.replace(/[^0-9+]/g, '');
                // User might need to format it differently? Let's keep it mostly as is but remove spaces
                number = number.replace(/\s/g, "");
                values[variable] = number;
            }
        } catch (err) {
            console.error("Contact pick failed", err);
        }
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
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div class="modal" on:click|stopPropagation role="document">
            <h2>{$T.enter_details}</h2>
            <p class="preview">{code}</p>

            {#each variables as v}
                <div class="form-group">
                    <label for={v}>{v}</label>
                    <div class="input-wrapper">
                        <input
                            id={v}
                            type={v.toLowerCase().includes("phone")
                                ? "tel"
                                : "text"}
                            bind:value={values[v]}
                        />
                        {#if v.toLowerCase().includes("phone") || v
                                .toLowerCase()
                                .includes("contact")}
                            <button
                                class="icon-btn"
                                on:click={() => pickContact(v)}>👤</button
                            >
                        {/if}
                    </div>
                </div>
            {/each}

            <div class="actions">
                <button class="cancel-btn" on:click={close}>{$T.cancel}</button>
                <button class="save-btn" on:click={execute}>{$T.dial}</button>
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
        margin-bottom: 8px;
        color: var(--primary-color);
    }

    .preview {
        font-family: monospace;
        background: #f5f5f5;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 20px;
        word-break: break-all;
        color: #666;
    }

    .form-group {
        margin-bottom: 16px;
    }

    label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: #666;
        text-transform: capitalize;
    }

    .input-wrapper {
        display: flex;
        gap: 8px;
    }

    input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        background: var(--background-color);
        color: var(--on-surface);
    }

    .icon-btn {
        padding: 0 12px;
        background: #eee;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
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
