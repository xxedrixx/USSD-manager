<script>
    import { getCarrier } from "../lib/carriers";

    export let carrier;
    // "dot": round initial for cards; "chip": full name.
    export let variant = "dot";

    $: info = getCarrier(carrier);
</script>

{#if info}
    <span
        class="badge {variant}"
        style="--carrier-bg: {info.color}; --carrier-fg: {info.textColor}"
        title={info.name}
        aria-label={info.name}
    >
        {variant === "dot" ? info.name.charAt(0) : info.name}
    </span>
{/if}

<style>
    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--carrier-bg);
        color: var(--carrier-fg);
        font-weight: 700;
        flex-shrink: 0;
        line-height: 1;
    }

    .dot {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1rem;
    }

    .chip {
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 0.75rem;
    }
</style>
