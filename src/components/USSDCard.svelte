<script>
    import { createEventDispatcher } from "svelte";
    import Icon from "./Icon.svelte";
    import CarrierBadge from "./CarrierBadge.svelte";
    import CodeText from "./CodeText.svelte";

    export let code;

    const dispatch = createEventDispatcher();

    function handleDial() {
        dispatch("dial", code);
    }

    function handleKeydown(e) {
        if (e.target === e.currentTarget && e.key === "Enter") handleDial();
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

<div
    class="m3-card glass current-card card-actionable"
    on:click={handleDial}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
>
    <div class="header">
        <CarrierBadge carrier={code.carrier} />
        <div class="info">
            <h3>{code.title}</h3>
            <div class="ussd-code"><CodeText code={code.code} /></div>
        </div>
        <div class="actions">
            <button
                class="icon-btn {code.is_favorite ? 'active' : ''}"
                on:click|stopPropagation={handleFavorite}
                title="Favorite"
            >
                <Icon name="favorite" filled={!!code.is_favorite} size={20} />
            </button>
            <button
                class="icon-btn"
                on:click|stopPropagation={handleEdit}
                title="Edit"
            >
                <Icon name="edit" size={20} />
            </button>
            <button
                class="icon-btn delete-btn"
                on:click|stopPropagation={handleDelete}
                title="Delete"
            >
                <Icon name="delete" size={20} />
            </button>
        </div>
    </div>
</div>

<style>
    .header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .info {
        flex: 1;
        min-width: 0;
    }

    .info h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--md-sys-color-on-surface);
    }

    .ussd-code {
        margin-top: 4px;
        color: var(--md-sys-color-primary);
        font-weight: 500;
        font-size: 0.85rem;
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
</style>
