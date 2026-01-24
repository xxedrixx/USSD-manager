<script>
    import { onMount } from "svelte";
    import { Capacitor } from "@capacitor/core";
    import { dbService } from "./services/db";
    import { T } from "./services/i18n";
    import USSDCard from "./components/USSDCard.svelte";
    import AddCodeModal from "./components/AddCodeModal.svelte";
    import ExecutionDialog from "./components/ExecutionDialog.svelte";
    import LanguageSwitcher from "./components/LanguageSwitcher.svelte";
    import ConfirmModal from "./components/ConfirmModal.svelte";
    import { dndzone } from "svelte-dnd-action";

    let codes = [];
    let selectedCategory = "ALL";

    let isModalOpen = false;
    let isEditMode = false;
    let isExecutionOpen = false;
    let executionCode = "";

    // Dialog States
    let isConfirmOpen = false;
    let confirmTitle = "";
    let confirmMessage = "";
    let confirmCallback = null;

    let currentCode = {
        title: "",
        code: "",
        category: "ALL",
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
            id: "FAVORITES",
            icon: "favorite",
            label: $T.categories?.favorites || "Favs",
        },
    ];

    onMount(async () => {
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
        };
        isModalOpen = true;
    }

    function openEditModal(code) {
        isEditMode = true;
        currentCode = { ...code };
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
            );
        } else {
            await dbService.addCode(data.title, data.code, data.category);
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

    const flipDurationMs = 300;

    function handleDndConsider(e) {
        codes = e.detail.items;
    }

    async function handleDndFinalize(e) {
        // e.detail.items is the reordered list for the CURRENT category
        const reorderedFiltered = e.detail.items;

        // Create a copy of all codes to update their order
        const updatedAllCodes = [...codes];

        // Map the new order from the filtered list back to the global list
        // This ensures that reordering "Favorites" doesn't delete "SMS" codes
        reorderedFiltered.forEach((item, index) => {
            const globalIdx = updatedAllCodes.findIndex(
                (c) => c.id === item.id,
            );
            if (globalIdx !== -1) {
                // Update the local storage order
                dbService.updateOrder(item.id, index);
            }
        });

        // Update local state and refresh from DB to be safe
        codes = [...updatedAllCodes];
        await refreshData();
    }

    function handleDial(event) {
        const code = event.detail.code || event.detail;
        const codeObj = typeof code === "string" ? { code: code } : code;
        let codeStr = codeObj.code;

        if (codeStr.includes("{") && codeStr.includes("}")) {
            executionCode = codeStr;
            isExecutionOpen = true;
        } else {
            performDial(codeStr);
        }
    }

    async function performDial(codeStr) {
        if (Capacitor.isNativePlatform()) {
            try {
                const { CallNumber } = await import("capacitor-call-number");

                // USSD codes need to be passed exactly as they are to the plugin
                // but some Android versions might require encoding.
                // We'll try direct execution first.
                await CallNumber.call({
                    number: codeStr,
                    bypassAppChooser: true,
                });
            } catch (err) {
                console.error("Dial failed", err);

                // Fallback for USSD is sensitive: # must be %23
                const encodedCode = codeStr.replace(/#/g, "%23");
                window.location.href = `tel:${encodedCode}`;
            }
        } else {
            window.location.href = `tel:${codeStr.replace(/#/g, "%23")}`;
        }
        isExecutionOpen = false;
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
            <span class="material-symbols-outlined">search</span>
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
                <span class="material-symbols-outlined large">inventory_2</span>
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
                <span class="material-symbols-outlined large">search_off</span>
                <p>
                    {$T.no_codes_found || "No codes found for this category."}
                </p>
            </div>
        {:else}
            <div
                class="grid"
                use:dndzone={{ items: filteredCodes, flipDurationMs }}
                on:consider={handleDndConsider}
                on:finalize={handleDndFinalize}
            >
                {#each filteredCodes as code (code.id)}
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

    <button class="fab m3-button-primary glass" on:click={openAddModal}>
        <span class="material-symbols-outlined">add</span>
    </button>

    <nav class="bottom-island glass">
        {#each categories as cat}
            <button
                class="nav-item {selectedCategory === cat.id ? 'active' : ''}"
                on:click={() => handleCategorySelect(cat.id)}
            >
                <span class="material-symbols-outlined">{cat.icon}</span>
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

    <ExecutionDialog
        isOpen={isExecutionOpen}
        code={executionCode}
        on:close={() => (isExecutionOpen = false)}
        on:execute={onExecute}
    />

    <ConfirmModal
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        on:close={() => (isConfirmOpen = false)}
        on:confirm={() => {
            if (confirmCallback) confirmCallback();
            isConfirmOpen = false;
        }}
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
        font-size: 64px;
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

    .fab .material-symbols-outlined {
        font-size: 28px;
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

    .nav-item .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400;
    }

    .nav-item.active .material-symbols-outlined {
        font-variation-settings:
            "FILL" 1,
            "wght" 400;
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
