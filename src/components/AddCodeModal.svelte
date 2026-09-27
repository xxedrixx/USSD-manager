<script>
    import { createEventDispatcher, tick } from "svelte";
    import { T } from "../services/i18n";
    import { carriers } from "../lib/carriers";
    import {
        AMOUNT,
        NUMBER,
        hasPlaceholders,
        validateTemplate,
    } from "../lib/placeholders";
    import Modal from "./Modal.svelte";
    import Icon from "./Icon.svelte";
    import CarrierBadge from "./CarrierBadge.svelte";
    import CodeText from "./CodeText.svelte";

    export let isOpen = false;
    export let editMode = false;
    export let codeData = {
        title: "",
        code: "",
        category: "ALL",
        carrier: "",
    };

    const dispatch = createEventDispatcher();

    let codeInput;
    let submitted = false;

    // Show errors only after a first save attempt.
    $: if (isOpen) submitted = false;

    $: categories = [
        { id: "ALL", icon: "home", label: $T.categories?.all || "General" },
        { id: "SMS", icon: "sms", label: $T.categories?.sms || "SMS" },
        { id: "CALL", icon: "call", label: $T.categories?.call || "Call" },
        {
            id: "INTERNET",
            icon: "wifi",
            label: $T.categories?.internet || "Data",
        },
        {
            id: "MONEY",
            icon: "payments",
            label: $T.categories?.money || "Money",
        },
    ];

    $: titleError = codeData.title.trim() ? null : "required";
    $: codeError = validateTemplate(codeData.code);

    function close() {
        dispatch("close");
    }

    // Inserts {number} / {amount} at the cursor: the phone keyboard used for
    // the code field has no { } keys.
    async function insertPlaceholder(name) {
        const token = `{${name}}`;
        const start = codeInput.selectionStart ?? codeData.code.length;
        const end = codeInput.selectionEnd ?? start;
        codeData.code =
            codeData.code.slice(0, start) + token + codeData.code.slice(end);
        await tick();
        codeInput.focus();
        codeInput.setSelectionRange(
            start + token.length,
            start + token.length,
        );
    }

    function save() {
        submitted = true;
        if (titleError || codeError) return;
        dispatch("save", {
            ...codeData,
            title: codeData.title.trim(),
            code: codeData.code.trim(),
        });
    }
</script>

<Modal open={isOpen} labelledby="add-code-title" on:close={close}>
    <form on:submit|preventDefault={save} novalidate>
        <h2 id="add-code-title">
            {editMode ? $T.edit_code || "Edit Code" : $T.add_code || "Add Code"}
        </h2>

        <div class="form-group">
            <label for="title">{$T.title || "Name"}</label>
            <input
                id="title"
                type="text"
                bind:value={codeData.title}
                placeholder="Solde"
                class:invalid={submitted && titleError}
            />
            {#if submitted && titleError}
                <p class="error">{$T.errors?.[titleError]}</p>
            {/if}
        </div>

        <div class="form-group">
            <label for="code">{$T.ussd_code || "USSD Code"}</label>
            <input
                id="code"
                type="tel"
                bind:this={codeInput}
                bind:value={codeData.code}
                placeholder="*123#"
                class:invalid={submitted && codeError}
            />
            {#if submitted && codeError}
                <p class="error">{$T.errors?.[codeError]}</p>
            {/if}
            <div class="insert-row">
                <button
                    type="button"
                    class="insert-chip"
                    on:click={() => insertPlaceholder(NUMBER)}
                >
                    <Icon name="add" size={16} />
                    {$T.variables?.number || "Number"}
                </button>
                <button
                    type="button"
                    class="insert-chip"
                    on:click={() => insertPlaceholder(AMOUNT)}
                >
                    <Icon name="add" size={16} />
                    {$T.variables?.amount || "Amount"}
                </button>
            </div>
            {#if !codeError && hasPlaceholders(codeData.code)}
                <div class="preview">
                    <span class="preview-label">{$T.preview || "Preview"}</span>
                    <CodeText code={codeData.code} />
                </div>
            {:else}
                <p class="hint">{$T.placeholder_hint}</p>
            {/if}
        </div>

        <div class="form-group">
            <span class="label">{$T.carrier || "Carrier"}</span>
            <div class="chip-row">
                <button
                    type="button"
                    class="cat-chip {!codeData.carrier ? 'active' : ''}"
                    on:click={() => (codeData.carrier = "")}
                >
                    {$T.carrier_none || "None"}
                </button>
                {#each carriers as carrier}
                    <button
                        type="button"
                        class="cat-chip {codeData.carrier === carrier.id
                            ? 'active'
                            : ''}"
                        on:click={() => (codeData.carrier = carrier.id)}
                    >
                        <CarrierBadge carrier={carrier.id} variant="chip" />
                    </button>
                {/each}
            </div>
        </div>

        <div class="form-group">
            <span class="label">{$T.category || "Category"}</span>
            <div class="category-grid">
                {#each categories as cat}
                    <button
                        type="button"
                        class="cat-chip {codeData.category === cat.id
                            ? 'active'
                            : ''}"
                        on:click={() => (codeData.category = cat.id)}
                    >
                        <Icon name={cat.icon} size={18} />
                        <span>{cat.label}</span>
                    </button>
                {/each}
            </div>
        </div>

        <div class="actions">
            <button
                type="button"
                class="m3-button m3-button-secondary"
                on:click={close}>{$T.cancel || "Cancel"}</button
            >
            <button type="submit" class="m3-button m3-button-primary"
                >{$T.save || "Save"}</button
            >
        </div>
    </form>
</Modal>

<style>
    h2 {
        margin-bottom: 24px;
        font-size: 1.5rem;
        color: var(--md-sys-color-on-surface);
    }

    .form-group {
        margin-bottom: 20px;
    }

    label,
    .label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface-variant);
    }

    input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--radius-m);
        font-size: 1rem;
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface);
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: var(--md-sys-color-primary);
        border-width: 2px;
    }

    input.invalid {
        border-color: var(--md-sys-color-error);
    }

    .error {
        margin: 6px 0 0;
        font-size: 0.8rem;
        color: var(--md-sys-color-error);
    }

    .hint {
        margin: 8px 0 0;
        font-size: 0.8rem;
        line-height: 1.4;
        color: var(--md-sys-color-on-surface-variant);
    }

    .insert-row {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }

    .insert-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px 6px 8px;
        border-radius: 999px;
        border: 1px solid var(--md-sys-color-outline-variant);
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
    }

    .preview {
        margin-top: 8px;
        padding: 10px 12px;
        border-radius: var(--radius-m);
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface-variant);
        font-size: 0.9rem;
    }

    .preview-label {
        display: block;
        font-size: 0.75rem;
        margin-bottom: 4px;
    }

    .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .cat-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: var(--radius-m);
        border: 1px solid var(--md-sys-color-outline);
        background: none;
        color: var(--md-sys-color-on-surface-variant);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
    }

    .cat-chip.active {
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        border-color: var(--md-sys-color-primary);
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
