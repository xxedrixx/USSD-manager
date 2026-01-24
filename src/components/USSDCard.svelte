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

    function handleDelete() {
        dispatch("delete", code.id);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events events_have_key_events -->
<div
    class="m3-card glass current-card card-actionable"
    on:click={handleDial}
    role="button"
    tabindex="0"
>
    <div class="header">
        <div class="info">
            <h3>{code.title}</h3>
            <code class="ussd-code">{code.code}</code>
        </div>
        <div class="actions">
            <button
                class="icon-btn {code.is_favorite ? 'active' : ''}"
                on:click|stopPropagation={handleFavorite}
                title="Favorite"
            >
                <span
                    class="material-symbols-outlined"
                    style={code.is_favorite
                        ? "font-variation-settings: 'FILL' 1"
                        : ""}
                >
                    favorite
                </span>
            </button>
            <button
                class="icon-btn"
                on:click|stopPropagation={handleEdit}
                title="Edit"
            >
                <span class="material-symbols-outlined">edit</span>
            </button>
            <button
                class="icon-btn delete-btn"
                on:click|stopPropagation={handleDelete}
                title="Delete"
            >
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    </div>
</div>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--md-sys-color-on-surface);
    }

    .ussd-code {
        display: block;
        margin-top: 4px;
        color: var(--md-sys-color-primary);
        font-weight: 500;
        font-size: 0.85rem;
        font-family: monospace;
    }

    .actions {
        display: flex;
        gap: 4px;
    }

    .icon-btn {
        background: none;
        border: none;
        color: var(--md-sys-color-on-surface-variant);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .icon-btn:hover {
        background-color: var(--md-sys-color-surface-variant);
    }

    .icon-btn.active {
        color: #e91e63; /* M3 Heart Pink/Red */
    }

    .delete-btn:hover {
        color: var(--md-sys-color-error);
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
</style>
