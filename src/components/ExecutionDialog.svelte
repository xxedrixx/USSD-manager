<script>
    // Asks for the placeholder values of a code ({number}, {amount}, ...)
    // before handing the final code to the dialer. Mounted fresh for every
    // use, so values from a previous transfer are never reused by accident.
    import { createEventDispatcher } from "svelte";
    import { T } from "../services/i18n";
    import { carrierFromNumber, getCarrier } from "../lib/carriers";
    import {
        fillTemplate,
        formatAmount,
        formatNumber,
        getPlaceholders,
        normalizeAmount,
        normalizeNumber,
        validateValue,
    } from "../lib/placeholders";
    import Modal from "./Modal.svelte";
    import Icon from "./Icon.svelte";
    import CarrierBadge from "./CarrierBadge.svelte";
    import CodeText from "./CodeText.svelte";

    export let code; // { title, code, category, carrier }

    const dispatch = createEventDispatcher();

    const fields = getPlaceholders(code.code);
    let raw = Object.fromEntries(fields.map((f) => [f.name, ""]));
    let submitted = false;

    function normalize(kind, value) {
        if (kind === "number") return normalizeNumber(value);
        if (kind === "amount") return normalizeAmount(value);
        return value.trim();
    }

    $: values = Object.fromEntries(
        fields.map((f) => [f.name, normalize(f.kind, raw[f.name])]),
    );
    $: errors = Object.fromEntries(
        fields.map((f) => [f.name, validateValue(f.kind, values[f.name])]),
    );
    $: isValid = fields.every((f) => !errors[f.name]);

    // A cash point must be on the code's network. Transfers can go to other
    // networks, so for them the detected network is only shown.
    const expectedCarrier =
        code.category === "WITHDRAW" ? getCarrier(code.carrier) : null;

    // Digits only, so the field can't break the USSD command.
    function handleAmountInput(e, name) {
        raw[name] = normalizeAmount(e.target.value);
        e.target.value = raw[name];
    }

    function focusOnMount(node, enabled) {
        if (enabled) node.focus();
    }

    function close() {
        dispatch("close");
    }

    function execute() {
        submitted = true;
        if (!isValid) return;
        dispatch("execute", fillTemplate(code.code, values));
    }
</script>

<Modal open labelledby="execution-title" on:close={close}>
    <form on:submit|preventDefault={execute} novalidate>
        <div class="title-row">
            <CarrierBadge carrier={code.carrier} />
            <h2 id="execution-title">{code.title}</h2>
        </div>

        {#each fields as field, i}
            {@const error = submitted ? errors[field.name] : null}
            {@const detected =
                field.kind === "number"
                    ? carrierFromNumber(values[field.name])
                    : null}
            <div class="form-group">
                <label for="field-{i}"
                    >{$T.variables?.[field.name] || field.name}</label
                >
                {#if field.kind === "amount"}
                    <div class="amount-input">
                        <input
                            id="field-{i}"
                            type="text"
                            inputmode="numeric"
                            autocomplete="off"
                            value={raw[field.name]}
                            on:input={(e) => handleAmountInput(e, field.name)}
                            class:invalid={error}
                            use:focusOnMount={i === 0}
                        />
                        <span class="unit">Ar</span>
                    </div>
                    {#if values[field.name]}
                        <p class="hint">{formatAmount(values[field.name])} Ar</p>
                    {/if}
                {:else}
                    <input
                        id="field-{i}"
                        type={field.kind === "number" ? "tel" : "text"}
                        autocomplete="off"
                        bind:value={raw[field.name]}
                        class:invalid={error}
                        use:focusOnMount={i === 0}
                    />
                    {#if detected && expectedCarrier && detected.id !== expectedCarrier.id}
                        <p class="warning">
                            <Icon name="warning" size={16} />
                            {$T.carrier_mismatch.replace(
                                "{carrier}",
                                detected.name,
                            )}
                        </p>
                    {:else if detected}
                        <p class="hint detected">
                            <CarrierBadge carrier={detected.id} variant="chip" />
                            {formatNumber(values[field.name])}
                        </p>
                    {/if}
                {/if}
                {#if error}
                    <p class="error">{$T.errors?.[error]}</p>
                {/if}
            </div>
        {/each}

        <div class="preview">
            <span class="preview-label">{$T.preview || "Preview"}</span>
            <CodeText code={code.code} {values} />
        </div>
        <p class="hint">{$T.dialer_hint}</p>

        <div class="actions">
            <button
                type="button"
                class="m3-button m3-button-secondary"
                on:click={close}>{$T.cancel || "Cancel"}</button
            >
            <button type="submit" class="m3-button m3-button-primary">
                <Icon name="dialpad" size={18} />
                {$T.dial || "Dial"}
            </button>
        </div>
    </form>
</Modal>

<style>
    .title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }

    h2 {
        font-size: 1.35rem;
        color: var(--md-sys-color-on-surface);
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
    }

    input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--radius-m);
        font-size: 1.1rem;
        background: var(--md-sys-color-background);
        color: var(--md-sys-color-on-surface);
        outline: none;
    }

    input:focus {
        border-color: var(--md-sys-color-primary);
        border-width: 2px;
    }

    input.invalid {
        border-color: var(--md-sys-color-error);
    }

    .amount-input {
        position: relative;
    }

    .amount-input input {
        padding-right: 48px;
    }

    .unit {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--md-sys-color-on-surface-variant);
        font-weight: 500;
    }

    .hint,
    .warning,
    .error {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px 0 0;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    .hint {
        color: var(--md-sys-color-on-surface-variant);
    }

    .warning {
        color: #b26a00;
    }

    .error {
        color: var(--md-sys-color-error);
    }

    .preview {
        margin-top: 20px;
        padding: 12px;
        border-radius: var(--radius-m);
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface-variant);
        font-size: 0.95rem;
    }

    .preview-label {
        display: block;
        font-size: 0.75rem;
        margin-bottom: 4px;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
    }

    .m3-button {
        padding: 10px 24px;
        font-size: 0.9rem;
    }

    @media (prefers-color-scheme: dark) {
        .warning {
            color: #ffb74d;
        }
    }
</style>
