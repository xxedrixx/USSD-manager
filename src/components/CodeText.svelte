<script>
    import { T } from "../services/i18n";
    import { parseTemplate } from "../lib/placeholders";

    export let code;
    // When given, filled placeholders show their value instead of their name.
    export let values = null;

    $: parts = parseTemplate(code || "");
</script>

<code class="code"
    >{#each parts as part}{#if part.text !== undefined}{part.text}{:else if values?.[part.placeholder]}<span
                class="value">{values[part.placeholder]}</span
            >{:else}<span class="slot">{$T.variables?.[part.placeholder] ||
                    part.placeholder}</span
            >{/if}{/each}</code
>

<style>
    .code {
        font-family: monospace;
        word-break: break-all;
    }

    .slot {
        display: inline-block;
        border-radius: 6px;
        padding: 0 5px;
        margin: 1px;
        font-family: var(--font-family);
        font-size: 0.85em;
        line-height: 1.5;
        word-break: normal;
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
    }

    /* No padding: the preview must not look like it contains spaces. */
    .value {
        font-weight: 700;
        color: var(--md-sys-color-primary);
    }
</style>
