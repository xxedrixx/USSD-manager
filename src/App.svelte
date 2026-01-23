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

    const categories = [
        { id: "ALL", icon: "home", label: "All" },
        { id: "SMS", icon: "sms", label: "SMS" },
        { id: "CALL", icon: "call", label: "Call" },
        { id: "INTERNET", icon: "language_us_phone", label: "Data" },
        { id: "FAVORITES", icon: "star", label: "Favs" },
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
                await CallNumber.call({
                    number: codeStr,
                    bypassAppChooser: true,
                });
            } catch (err) {
                console.error("Dial failed", err);
                // Fallback
                window.location.href = `tel:${codeStr.replace(/#/g, "%23")}`;
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
    <header class="glass">
        <div class="header-top">
            <h1>{$T.app_title || "USSD Manager"}</h1>
            <LanguageSwitcher />
        </div>
        <div class="search-bar m3-card glass">
            <span class="material-symbols-outlined">search</span>
            <input
                type="text"
                placeholder={$T.search_placeholder || "Search codes..."}
                bind:value={searchQuery}
            />
        </div>
    </header>

    <div class="content">
        {#if codes.length === 0}
            <div class="empty-state">
                <span class="material-symbols-outlined large">inventory_2</span>
                <p>No codes added yet.</p>
                <button
                    class="m3-button m3-button-primary"
                    on:click={openAddModal}>Add Your First Code</button
                >
            </div>
        {:else if filteredCodes.length === 0}
            <div class="empty-state">
                <span class="material-symbols-outlined large">search_off</span>
                <p>No codes found for this category.</p>
            </div>
        {:else}
            <div class="grid">
                {#each filteredCodes as code (code.id)}
                    <USSDCard
                        {code}
                        on:dial={handleDial}
                        on:favorite={handleFavorite}
                        on:edit={() => openEditModal(code)}
                        on:delete={handleDelete}
                    />
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
        padding-bottom: 100px; /* Space for bottom island */
    }

    header {
        padding: 16px;
        padding-top: calc(16px + env(safe-area-inset-top, 0px));
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: var(--md-sys-color-background);
        border-bottom: var(--glass-border);
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--md-sys-color-primary);
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-radius: var(--radius-xl);
    }

    .search-bar input {
        flex: 1;
        border: none;
        background: transparent;
        color: var(--md-sys-color-on-surface);
        font-size: 1rem;
        outline: none;
    }

    .content {
        padding: 16px;
    }

    .grid {
        display: flex;
        flex-direction: column;
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
        bottom: 100px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 90;
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
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 48px);
        max-width: 450px;
        height: 64px;
        background-color: var(--md-sys-color-surface);
        border-radius: var(--radius-xl);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 0 8px;
        z-index: 1000;
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
</style>
