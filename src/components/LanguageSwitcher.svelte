<script>
    import { locale, setLocale } from "../services/i18n";
</script>

<div class="language-switcher">
    <button class:active={$locale === "fr"} on:click={() => setLocale("fr")}>
        <svg class="flag" viewBox="0 0 3 2" width="20" height="14">
            <rect width="1" height="2" fill="#002395" />
            <rect width="1" height="2" x="1" fill="#fff" />
            <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
        <span class="label">FR</span>
    </button>
    <button class:active={$locale === "mg"} on:click={() => setLocale("mg")}>
        <svg class="flag" viewBox="0 0 3 2" width="20" height="14">
            <rect width="1" height="2" fill="#fff" />
            <rect width="2" height="1" x="1" fill="#FC3D32" />
            <rect width="2" height="1" x="1" y="1" fill="#007E3A" />
        </svg>
        <span class="label">MG</span>
    </button>
</div>

<style>
    .language-switcher {
        display: flex;
        background: var(--md-sys-color-surface-variant);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 24px;
        padding: 4px;
        gap: 4px;
        transition: var(--transition-standard);
    }

    button {
        background: none;
        border: none;
        color: var(--md-sys-color-on-surface-variant);
        padding: 6px 10px;
        font-size: 0.9rem;
        cursor: pointer;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: var(--transition-standard);
        font-weight: 600;
    }

    .flag {
        border-radius: 2px;
        box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1);
    }

    .label {
        font-size: 0.75rem;
    }

    button.active {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
</style>
