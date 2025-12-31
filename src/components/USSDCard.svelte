<script>
    import { createEventDispatcher } from "svelte";

    export let code;

    const dispatch = createEventDispatcher();

    function handleDial() {
        dispatch("dial", code);
    }

    function handleFavorite() {
        dispatch("favorite", code);
    }

    function handleEdit() {
        dispatch("edit", code);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="card">
    <div class="header">
        <div
            class="info"
            on:click={handleDial}
            role="button"
            tabindex="0"
            on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleDial();
            }}
        >
            <h3>{code.title}</h3>
            <code class="ussd-code">{code.code}</code>
        </div>
        <div class="actions">
            <button
                class="icon-btn {code.is_favorite ? 'active' : ''}"
                on:click|stopPropagation={handleFavorite}
            >
                ★
            </button>
            <button class="icon-btn" on:click|stopPropagation={handleEdit}>
                ✎
            </button>
        </div>
    </div>
</div>

<style>
    .card {
        background: var(--surface-color);
        border-radius: var(--radius);
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: var(--elevation-1);
        transition: transform 0.1s;
        cursor: pointer;
    }

    .card:active {
        transform: scale(0.98);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--on-surface);
    }

    .ussd-code {
        display: block;
        margin-top: 4px;
        color: var(--primary-color);
        font-weight: bold;
        font-size: 0.9rem;
    }

    .actions {
        display: flex;
        gap: 8px;
    }

    .icon-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: #999;
        cursor: pointer;
        padding: 8px;
    }

    .icon-btn.active {
        color: #ffc107;
    }

    .icon-btn:hover {
        background: #f0f0f0;
        border-radius: 50%;
    }
</style>
