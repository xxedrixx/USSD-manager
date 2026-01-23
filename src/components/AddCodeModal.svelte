<script>
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";

    export let isOpen = false;
    export let editMode = false;
    export let codeData = {
        title: "",
        code: "",
        category: "ALL",
    };

    const dispatch = createEventDispatcher();

    $: categories = [
        { id: "ALL", icon: "home", label: $T.categories?.all || "General" },
        { id: "SMS", icon: "sms", label: $T.categories?.sms || "SMS" },
        { id: "CALL", icon: "call", label: $T.categories?.call || "Call" },
        {
            id: "INTERNET",
            icon: "wifi",
            label: $T.categories?.internet || "Data",
        },
    ];

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
        <div
            class="m3-card glass modal"
            on:click|stopPropagation
            role="document"
        >
            <h2>
                {editMode
                    ? $T.edit_code || "Edit Code"
                    : $T.add_code || "Add Code"}
            </h2>

            <div class="form-group">
                <label for="title">{$T.title || "Name"}</label>
                <input
                    id="title"
                    type="text"
                    bind:value={codeData.title}
                    placeholder="Solde"
                />
            </div>

            <div class="form-group">
                <label for="code">{$T.ussd_code || "USSD Code"}</label>
                <input
                    id="code"
                    type="tel"
                    bind:value={codeData.code}
                    placeholder="*123#"
                />
            </div>

            <div class="form-group">
                <label for="category">{$T.category || "Category"}</label>
                <div class="category-grid">
                    {#each categories as cat}
                        <button
                            class="cat-chip {codeData.category === cat.id
                                ? 'active'
                                : ''}"
                            on:click={() => (codeData.category = cat.id)}
                        >
                            <span class="material-symbols-outlined"
                                >{cat.icon}</span
                            >
                            <span>{cat.label}</span>
                        </button>
                    {/each}
                </div>
            </div>

            <div class="actions">
                <button class="m3-button m3-button-secondary" on:click={close}
                    >{$T.cancel || "Cancel"}</button
                >
                <button class="m3-button m3-button-primary" on:click={save}
                    >{$T.save || "Save"}</button
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
        margin-bottom: 24px;
        font-size: 1.5rem;
        color: var(--md-sys-color-on-surface);
    }

    .form-group {
        margin-bottom: 20px;
    }

    label {
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
    }

    .cat-chip span {
        font-size: 0.9rem;
    }

    .cat-chip.active {
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        border-color: var(--md-sys-color-primary);
    }

    .cat-chip .material-symbols-outlined {
        font-size: 18px;
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
