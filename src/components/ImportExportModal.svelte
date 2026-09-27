<script>
    import { createEventDispatcher } from "svelte";
    import { Capacitor } from "@capacitor/core";
    import { T } from "../services/i18n";
    import {
        parseCodes,
        risksOf,
        serializeCodes,
        splitDuplicates,
    } from "../lib/transfer";
    import Modal from "./Modal.svelte";
    import Icon from "./Icon.svelte";
    import CarrierBadge from "./CarrierBadge.svelte";
    import CodeText from "./CodeText.svelte";

    export let isOpen = false;
    export let codes = []; // shown in the current tab: what gets shared
    export let existing = []; // every saved code: for duplicates

    const dispatch = createEventDispatcher();
    const FILE_NAME = "codes-ussd.json";

    let text = "";
    let copied = false;
    let fileInput;
    let selected = new Set();

    $: if (isOpen) reset();

    $: parsed = text.trim() ? parseCodes(text) : null;
    $: split = parsed ? splitDuplicates(parsed.codes, existing) : null;
    $: items = (split?.fresh || []).map((c) => ({ ...c, risks: risksOf(c.code) }));
    // Codes that look risky start unticked.
    $: selected = new Set(
        items.map((c, i) => (c.risks.length ? null : i)).filter((i) => i !== null),
    );

    function reset() {
        text = "";
        copied = false;
    }

    function fmt(s, n) {
        return (s || "").replace("{n}", n);
    }

    async function shareFile() {
        const json = serializeCodes(codes);
        if (Capacitor.isNativePlatform()) {
            const { Filesystem, Directory, Encoding } = await import(
                "@capacitor/filesystem"
            );
            const { Share } = await import("@capacitor/share");
            const { uri } = await Filesystem.writeFile({
                path: FILE_NAME,
                data: json,
                directory: Directory.Cache,
                encoding: Encoding.UTF8,
            });
            try {
                await Share.share({ title: FILE_NAME, files: [uri] });
            } catch {
                // Share sheet closed without picking an app.
            }
        } else {
            const url = URL.createObjectURL(
                new Blob([json], { type: "application/json" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = FILE_NAME;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    async function copy() {
        const json = serializeCodes(codes);
        try {
            await navigator.clipboard.writeText(json);
        } catch {
            const area = document.createElement("textarea");
            area.value = json;
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
        }
        copied = true;
    }

    async function readFile(e) {
        const file = e.target.files?.[0];
        if (file) text = await file.text();
        e.target.value = "";
    }

    function toggle(i) {
        if (selected.has(i)) selected.delete(i);
        else selected.add(i);
        selected = selected;
    }

    function doImport() {
        const chosen = items
            .filter((_, i) => selected.has(i))
            .map(({ risks, ...c }) => c);
        if (chosen.length) dispatch("import", chosen);
    }
</script>

<Modal open={isOpen} labelledby="transfer-title" on:close={() => dispatch("close")}>
    <h2 id="transfer-title">{$T.transfer?.title}</h2>

    <section>
        <h3>{$T.transfer?.share}</h3>
        <p class="hint">{fmt($T.transfer?.share_hint, codes.length)}</p>
        <div class="row">
            <button
                class="m3-button m3-button-primary"
                on:click={shareFile}
                disabled={!codes.length}
            >
                <Icon name="share" size={18} />
                {$T.transfer?.share_file}
            </button>
            <button
                class="m3-button m3-button-secondary"
                on:click={copy}
                disabled={!codes.length}
            >
                <Icon name="content_copy" size={18} />
                {copied ? $T.transfer?.copied : $T.transfer?.copy}
            </button>
        </div>
    </section>

    <section>
        <h3>{$T.transfer?.import}</h3>
        <textarea
            rows="3"
            bind:value={text}
            placeholder={$T.transfer?.paste}
            aria-label={$T.transfer?.import}
        ></textarea>
        <button
            class="m3-button m3-button-outlined file-btn"
            on:click={() => fileInput.click()}
        >
            <Icon name="upload_file" size={18} />
            {$T.transfer?.choose_file}
        </button>
        <input type="file" hidden bind:this={fileInput} on:change={readFile} />

        {#if text.trim() && !parsed}
            <p class="error">{$T.transfer?.none}</p>
        {:else if parsed}
            <p class="summary">
                {fmt($T.transfer?.new, items.length)}
                {#if split.duplicates}· {fmt($T.transfer?.duplicates, split.duplicates)}{/if}
                {#if parsed.invalid}· {fmt($T.transfer?.invalid, parsed.invalid)}{/if}
            </p>
            {#if items.length}
                <p class="warning">
                    <Icon name="warning" size={16} />
                    {$T.transfer?.warning}
                </p>
                <ul class="preview">
                    {#each items as item, i}
                        <li>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selected.has(i)}
                                    on:change={() => toggle(i)}
                                />
                                <CarrierBadge carrier={item.carrier} variant="chip" />
                                <span class="item">
                                    <strong>{item.title}</strong>
                                    <CodeText code={item.code} />
                                    {#each item.risks as risk}
                                        <span class="risk">
                                            <Icon name="warning" size={14} />
                                            {$T.transfer?.[risk]}
                                        </span>
                                    {/each}
                                </span>
                            </label>
                        </li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </section>

    <div class="actions">
        <button
            class="m3-button m3-button-secondary"
            on:click={() => dispatch("close")}>{$T.cancel || "Cancel"}</button
        >
        {#if items.length}
            <button
                class="m3-button m3-button-primary"
                on:click={doImport}
                disabled={!selected.size}
            >
                {fmt($T.transfer?.import_button, selected.size)}
            </button>
        {/if}
    </div>
</Modal>

<style>
    h2 {
        margin-bottom: 16px;
        font-size: 1.4rem;
        color: var(--md-sys-color-on-surface);
    }

    h3 {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--md-sys-color-on-surface);
    }

    section {
        margin-bottom: 20px;
    }

    .row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .m3-button {
        padding: 10px 18px;
        font-size: 0.9rem;
    }

    .m3-button:disabled {
        opacity: 0.5;
        cursor: default;
    }

    .hint,
    .summary {
        margin: 0 0 10px;
        font-size: 0.85rem;
        color: var(--md-sys-color-on-surface-variant);
    }

    .summary {
        margin-top: 10px;
        font-weight: 600;
    }

    textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--radius-m);
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface);
        font: 0.85rem monospace;
        resize: vertical;
        outline: none;
    }

    textarea:focus {
        border-color: var(--md-sys-color-primary);
    }

    .file-btn {
        margin-top: 8px;
    }

    .error {
        margin: 10px 0 0;
        font-size: 0.85rem;
        color: var(--md-sys-color-error);
    }

    .warning,
    .risk {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.8rem;
        line-height: 1.4;
        color: #b26a00;
    }

    .warning {
        margin: 0 0 8px;
    }

    .preview {
        list-style: none;
        margin: 0;
        padding: 0;
        max-height: 260px;
        overflow-y: auto;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: var(--radius-m);
    }

    .preview li + li {
        border-top: 1px solid var(--md-sys-color-outline-variant);
    }

    .preview label {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        cursor: pointer;
    }

    .preview input {
        margin-top: 3px;
        accent-color: var(--md-sys-color-primary);
    }

    .item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        font-size: 0.85rem;
        color: var(--md-sys-color-primary);
    }

    .item strong {
        color: var(--md-sys-color-on-surface);
        font-weight: 600;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    @media (prefers-color-scheme: dark) {
        .warning,
        .risk {
            color: #ffb74d;
        }
    }
</style>
