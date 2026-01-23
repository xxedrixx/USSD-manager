<script>
    import { locale, setLocale } from "../services/i18n";
</script>

<div class="language-switcher">
    <button
        class:active={$locale === "fr"}
        on:click={() => setLocale("fr")}
        aria-label="Français"
        title="Français"
    >
        <svg class="flag" viewBox="0 0 3 2" width="24" height="16">
            <rect width="1" height="2" fill="#002395" />
            <rect width="1" height="2" x="1" fill="#fff" />
            <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
    </button>
    <button
        class:active={$locale === "mg"}
        on:click={() => setLocale("mg")}
        aria-label="Malagasy"
        title="Malagasy"
    >
        <svg class="flag" viewBox="0 0 3 2" width="24" height="16">
            <rect width="1" height="2" fill="#fff" />
            <rect width="2" height="1" x="1" fill="#FC3D32" />
            <rect width="2" height="1" x="1" y="1" fill="#007E3A" />
        </svg>
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
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-standard);
    }

    .flag {
        border-radius: 2px;
        box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.2);
    }

    button.active {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
</style>
