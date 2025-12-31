<script>
    import { onMount } from "svelte";
    import { Capacitor } from "@capacitor/core";
    import { dbService } from "./services/db";
    import { T } from "./services/i18n";
    import USSDCard from "./components/USSDCard.svelte";
    import AddCodeModal from "./components/AddCodeModal.svelte";
    import ExecutionDialog from "./components/ExecutionDialog.svelte";
    import CarrierTabs from "./components/CarrierTabs.svelte";
    import LanguageSwitcher from "./components/LanguageSwitcher.svelte";

    let codes = [];
    let carriers = [];
    let folders = [];

    let selectedCarrierId = 1;

    let isModalOpen = false;
    let isEditMode = false;
    let isExecutionOpen = false;
    let executionCode = "";

    let currentCode = {
        title: "",
        code: "",
        carrierId: 1,
        folderId: 1,
        contactName: "",
        contactNumber: "",
    };

    onMount(async () => {
        const initialized = await dbService.init();
        if (initialized) {
            await refreshData();
            if (carriers.length > 0) selectedCarrierId = carriers[0].id;
        } else {
            // Mock for browser dev
            carriers = [
                { id: 1, name: "Safaricom", color: "#00c853", logo: "S" },
                { id: 2, name: "Airtel", color: "#ff0000", logo: "A" },
                { id: 99, name: "General", color: "#6200ea", logo: "G" },
            ];
            folders = [
                { id: 1, name: "General", icon: "📁" },
                { id: 2, name: "Banking", icon: "🏦" },
            ];
            selectedCarrierId = 1;
        }
    });

    async function refreshData() {
        carriers = await dbService.getCarriers();
        folders = await dbService.getFolders();
        codes = await dbService.getCodes();
    }

    function handleCarrierSelect(event) {
        selectedCarrierId = event.detail;
    }

    function openAddModal() {
        isEditMode = false;
        currentCode = {
            title: "",
            code: "",
            carrierId: selectedCarrierId,
            folderId: folders[0]?.id || 1,
            contactName: "",
            contactNumber: "",
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
                data.carrierId,
                data.folderId,
                data.contactName,
                data.contactNumber,
            );
        } else {
            await dbService.addCode(
                data.title,
                data.code,
                data.carrierId,
                data.folderId,
                data.contactName,
                data.contactNumber,
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

    function performDial(codeStr) {
        let target = codeStr;
        if (codeStr.includes("#")) {
            target = codeStr.replace(/#/g, "%23");
        }
        window.location.href = `tel:${target}`;
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
        // For general carrier (99), maybe show everywhere? Or just strict filtering?
        // Strict filtering for now as requested "tabs to organize".
        const matchesCarrier = c.carrier_id === selectedCarrierId;
        return matchesSearch && matchesCarrier;
    });

    $: groupedCodes = [
        ...folders.map((folder) => ({
            ...folder,
            codes: filteredCodes.filter((c) => c.folder_id === folder.id),
        })),
        {
            id: "unsorted",
            name: $T.no_folder,
            codes: filteredCodes.filter((c) => !c.folder_id),
        },
    ].filter((group) => group.codes.length > 0);
</script>

<main>
    <header>
        <div class="header-top">
            <h1>{$T.app_title}</h1>
            <LanguageSwitcher />
        </div>
        <div class="search-bar">
            <input
                type="text"
                placeholder={$T.search_placeholder}
                bind:value={searchQuery}
            />
        </div>
    </header>

    <CarrierTabs
        {carriers}
        {selectedCarrierId}
        on:select={handleCarrierSelect}
    />

    <div class="content">
        {#if codes.length === 0 && carriers.length === 0}
            <div class="empty-state"><p>Loading...</p></div>
        {:else if groupedCodes.length === 0}
            <div class="empty-state">
                <p>No codes found for this carrier.</p>
                <button class="text-btn" on:click={openAddModal}
                    >Add New Code</button
                >
            </div>
        {/if}

        {#each groupedCodes as group}
            <div class="group">
                <h2 class="group-title" style="color: #666">
                    <span style="margin-right:8px;">{group.icon || ""}</span>
                    {group.name}
                </h2>

                {#each group.codes as code}
                    <USSDCard
                        {code}
                        on:dial={handleDial}
                        on:favorite={handleFavorite}
                        on:edit={() => openEditModal(code)}
                    />
                {/each}
            </div>
        {/each}
    </div>

    <button class="fab" on:click={openAddModal}>+</button>

    <AddCodeModal
        isOpen={isModalOpen}
        editMode={isEditMode}
        codeData={currentCode}
        {carriers}
        {folders}
        on:close={() => (isModalOpen = false)}
        on:save={handleSave}
    />

    <ExecutionDialog
        isOpen={isExecutionOpen}
        code={executionCode}
        on:close={() => (isExecutionOpen = false)}
        on:execute={onExecute}
    />
</main>

<style>
    header {
        background-color: var(--primary-color);
        color: var(--on-primary);
        padding: 16px;
        padding-top: env(safe-area-inset-top, 20px);
        box-shadow: var(--elevation-2);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    h1 {
        margin: 0;
        font-size: 1.25rem;
    }

    .content {
        padding: 16px;
        padding-bottom: 80px;
    }

    .group-title {
        font-size: 1rem;
        margin: 16px 0 8px 0;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .empty-state {
        text-align: center;
        color: #999;
        margin-top: 40px;
    }

    .fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--secondary-color);
        color: var(--on-secondary);
        border: none;
        font-size: 2rem;
        box-shadow: var(--elevation-2);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 90;
        padding-bottom: 5px; /* Adjust alignment */
    }

    .fab:active {
        transform: scale(0.95);
    }

    .text-btn {
        background: none;
        border: none;
        color: var(--primary-color);
        font-weight: bold;
        font-size: 1rem;
        margin-top: 10px;
        cursor: pointer;
    }
</style>
