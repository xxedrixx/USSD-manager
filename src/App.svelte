<script>
    import { onMount } from "svelte";
    import { dbService } from "./services/db";
    import { T, loadLocale } from "./services/i18n";
    import { hasPlaceholders } from "./lib/placeholders";
    import { mergeOrder } from "./lib/order";
    import USSDCard from "./components/USSDCard.svelte";
    import AddCodeModal from "./components/AddCodeModal.svelte";
    import ExecutionDialog from "./components/ExecutionDialog.svelte";
    import LanguageSwitcher from "./components/LanguageSwitcher.svelte";
    import ConfirmModal from "./components/ConfirmModal.svelte";
    import Icon from "./components/Icon.svelte";
    import { dndzone } from "svelte-dnd-action";

    let codes = [];
    let selectedCategory = "ALL";

    let isModalOpen = false;
    let isEditMode = false;
    // Code whose placeholders are being filled in, or null.
    let executionCode = null;

    // Dialog States
    let isConfirmOpen = false;
    let confirmTitle = "";
    let confirmMessage = "";
    let confirmCallback = null;

    let currentCode = {
        title: "",
        code: "",
        category: "ALL",
        carrier: "",
    };

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
        {
            id: "FAVORITES",
            icon: "favorite",
            label: $T.categories?.favorites || "Favs",
        },
    ];

    onMount(async () => {
        loadLocale();
        const initialized = await dbService.init();
        if (initialized) {
            await refreshData();
        }
    });

    async function refreshData() {
        codes = await dbService.getCodes();
    }

    function handleCategorySelect(id) {
        selectedCategory = id;
    }

    function openAddModal() {
        isEditMode = false;
        currentCode = {
            title: "",
            code: "",
            category:
                selectedCategory === "FAVORITES" ? "ALL" : selectedCategory,
            carrier: "",
        };
        isModalOpen = true;
    }

    function openEditModal(code) {
        isEditMode = true;
        currentCode = { ...code, carrier: code.carrier || "" };
        isModalOpen = true;
    }

    async function handleSave(event) {
        const data = event.detail;
        if (isEditMode) {
            await dbService.updateCode(
                data.id,
                data.title,
                data.code,
                data.category,
                data.carrier,
            );
        } else {
            await dbService.addCode(
                data.title,
                data.code,
                data.category,
                data.carrier,
            );
        }
        isModalOpen = false;
        await refreshData();
    }

    async function handleFavorite(event) {
        const code = event.detail;
        await dbService.toggleFavorite(code.id, !code.is_favorite);
        await refreshData();
    }

    async function handleDelete(event) {
        const id = event.detail;
        confirmTitle = $T.delete || "Delete";
        confirmMessage = $T.confirm_delete || "Delete this code?";
        confirmCallback = async () => {
            await dbService.deleteCode(id);
            await refreshData();
        };
        isConfirmOpen = true;
    }

    // Forget the pending action so it can't run after the dialog is gone.
    function closeConfirm() {
        isConfirmOpen = false;
        confirmCallback = null;
    }

    async function handleConfirm() {
        const callback = confirmCallback;
        closeConfirm();
        if (callback) await callback();
    }

    const flipDurationMs = 300;

    // The drag zone works on the visible (filtered) list; `codes` keeps the
    // full list so other categories are never touched by a drag.
    let dndItems = [];
    $: dndItems = filteredCodes;

    function handleDndConsider(e) {
        dndItems = e.detail.items;
    }

    async function handleDndFinalize(e) {
        dndItems = e.detail.items;
        codes = mergeOrder(codes, e.detail.items);
        await dbService.saveOrder(codes.map((c) => c.id));
        await refreshData();
    }

    function handleDial(event) {
        const code = event.detail;
        if (hasPlaceholders(code.code)) {
            executionCode = code;
        } else {
            performDial(code.code);
        }
    }

    // Opens the phone's dialer with the code typed in; the user presses call.
    // In a USSD code, # must be sent as %23.
    function performDial(codeStr) {
        executionCode = null;
        window.location.href = `tel:${codeStr.replace(/#/g, "%23")}`;
    }

    function onExecute(event) {
        performDial(event.detail);
    }

    let searchQuery = "";

    $: filteredCodes = codes.filter((c) => {
        const matchesSearch =
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.includes(searchQuery);

        const matchesCategory =
            selectedCategory === "ALL" ||
            (selectedCategory === "FAVORITES"
                ? c.is_favorite
                : c.category === selectedCategory);

        return matchesSearch && matchesCategory;
    });
</script>

<main>
    <header class="glass sticky-header">
        <div class="header-top">
            <h1>{$T.app_title || "USSD"}</h1>
            <LanguageSwitcher />
        </div>
        <div class="search-container m3-card glass">
            <Icon name="search" />
            <input
                type="text"
                placeholder={$T.search_placeholder || "Search..."}
                bind:value={searchQuery}
            />
        </div>
    </header>

    <div class="content">
        {#if codes.length === 0}
            <div class="empty-state">
                <span class="large"><Icon name="inventory_2" size={64} /></span>
                <p>{$T.no_codes_added || "No codes added yet."}</p>
                <button
                    class="m3-button m3-button-primary"
                    on:click={openAddModal}
                >
                    {$T.add_first_code || "Add Your First Code"}
                </button>
            </div>
        {:else if filteredCodes.length === 0}
            <div class="empty-state">
                <span class="large"><Icon name="search_off" size={64} /></span>
                <p>
                    {$T.no_codes_found || "No codes found for this category."}
                </p>
            </div>
        {:else}
            <div
                class="grid"
                use:dndzone={{
                    items: dndItems,
                    flipDurationMs,
                    delayTouchStart: true,
                }}
                on:consider={handleDndConsider}
                on:finalize={handleDndFinalize}
            >
                {#each dndItems as code (code.id)}
                    <div class="draggable-wrapper">
                        <USSDCard
                            {code}
                            on:dial={handleDial}
                            on:favorite={handleFavorite}
                            on:edit={() => openEditModal(code)}
                            on:delete={handleDelete}
                        />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <button
        class="fab m3-button-primary glass"
        on:click={openAddModal}
        aria-label={$T.add_code || "Add Code"}
    >
        <Icon name="add" size={28} />
    </button>

    <nav class="bottom-island glass">
        {#each categories as cat}
            <button
                class="nav-item {selectedCategory === cat.id ? 'active' : ''}"
                on:click={() => handleCategorySelect(cat.id)}
            >
                <Icon name={cat.icon} filled={selectedCategory === cat.id} />
                <span class="label">{cat.label}</span>
            </button>
        {/each}
    </nav>

    <AddCodeModal
        isOpen={isModalOpen}
        editMode={isEditMode}
        codeData={currentCode}
        on:close={() => (isModalOpen = false)}
        on:save={handleSave}
    />

    {#if executionCode}
        <ExecutionDialog
            code={executionCode}
            on:close={() => (executionCode = null)}
            on:execute={onExecute}
        />
    {/if}

    <ConfirmModal
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        on:close={closeConfirm}
        on:confirm={handleConfirm}
    />
</main>

<style>
    main {
        padding-bottom: calc(100px + env(safe-area-inset-bottom, 24px));
    }

    header {
        padding: 16px;
        padding-top: calc(16px + env(safe-area-inset-top, 0px));
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: var(--md-sys-color-background);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--md-sys-color-primary);
        letter-spacing: -0.5px;
    }

    .search-container {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-radius: var(--radius-xl);
        border: 1px solid var(--md-sys-color-outline);
        background-color: var(--md-sys-color-surface-variant) !important;
        transition: var(--transition-standard);
    }

    .search-container:focus-within {
        border-color: var(--md-sys-color-primary);
        border-width: 2px;
        background-color: var(--md-sys-color-surface) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .search-container input {
        flex: 1;
        border: none;
        background: transparent;
        color: var(--md-sys-color-on-surface);
        font-size: 1rem;
        outline: none;
    }

    .content {
        padding: 16px;
        padding-bottom: 120px; /* Space for bottom island */
    }

    .grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .draggable-wrapper {
        transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
        cursor: grab;
    }

    .draggable-wrapper:active {
        cursor: grabbing;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 32px;
        text-align: center;
        color: var(--md-sys-color-on-surface-variant);
    }

    .large {
        margin-bottom: 16px;
        opacity: 0.5;
    }

    .fab {
        position: fixed;
        /* Adjusted to be above the island */
        bottom: calc(112px + env(safe-area-inset-bottom, 0px));
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        border: none;
        cursor: pointer;
        padding: 0;
    }

    .fab {
        color: var(--md-sys-color-on-primary);
    }

    .bottom-island {
        position: fixed;
        /* Balanced bottom position */
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 40px);
        max-width: 450px;
        background-color: var(--md-sys-color-surface);
        border-radius: var(--radius-xl);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 8px;
        z-index: 1100; /* Higher than FAB slightly if needed */
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .nav-item {
        background: none;
        border: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        color: var(--md-sys-color-on-surface-variant);
        cursor: pointer;
        flex: 1;
        transition: color 0.2s;
        padding: 8px 0;
        -webkit-tap-highlight-color: transparent;
        outline: none;
    }

    .nav-item.active {
        color: var(--md-sys-color-primary);
    }

    .label {
        font-size: 0.7rem;
        font-weight: 500;
    }

    /* Suppress dnd focus outline */
    :global(.grid) {
        outline: none !important;
    }
</style>
