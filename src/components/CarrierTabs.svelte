<script>
    import { createEventDispatcher } from "svelte";

    export let carriers = [];
    export let selectedCarrierId = null;

    const dispatch = createEventDispatcher();

    function selectCarrier(id) {
        dispatch("select", id);
    }
</script>

<div class="tabs-container">
    <div class="tabs">
        {#each carriers as carrier}
            <button
                class="tab {selectedCarrierId === carrier.id ? 'active' : ''}"
                on:click={() => selectCarrier(carrier.id)}
                style="--active-color: {carrier.color ||
                    'var(--primary-color)'}"
            >
                {#if carrier.logo}
                    <div class="logo-placeholder">{carrier.logo}</div>
                {/if}
                <span class="name">{carrier.name}</span>
            </button>
        {/each}
    </div>
</div>

<style>
    .tabs-container {
        overflow-x: auto;
        background: var(--surface-color);
        box-shadow: var(--elevation-1);
        position: sticky;
        top: 60px; /* Adjust based on header height */
        z-index: 90;
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .tabs-container::-webkit-scrollbar {
        display: none;
    }

    .tabs {
        display: flex;
        padding: 0 16px;
        gap: 16px;
        height: 56px;
        align-items: center;
    }

    .tab {
        background: none;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-weight: 500;
        transition: all 0.2s;
        border: 1px solid transparent;
    }

    .tab.active {
        background: var(
            --active-color
        ); /* Fallback or specific carrier color bg? */
        background: rgba(0, 0, 0, 0.05); /* Lighter background */
        color: var(--active-color);
        border-color: var(--active-color);
    }

    /* Variant: Pill style active state */
    .tab.active {
        background: var(--active-color);
        color: #fff;
    }

    .logo-placeholder {
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8rem;
        font-weight: bold;
    }
</style>
