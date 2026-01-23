<script>
    import { locale, setLocale } from "../services/i18n";
</script>

<div class="language-switcher">
    <button class:active={$locale === "fr"} on:click={() => setLocale("fr")}
        >🇫🇷 <span class="label">FR</span></button
    >
    <button class:active={$locale === "mg"} on:click={() => setLocale("mg")}
        >🇲🇬 <span class="label">MG</span></button
    >
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
        padding: 6px 12px;
        font-size: 0.9rem;
        cursor: pointer;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: var(--transition-standard);
        font-weight: 600;
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
