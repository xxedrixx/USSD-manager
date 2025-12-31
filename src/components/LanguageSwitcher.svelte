<script>
    import { locale, setLocale } from "../services/i18n";
</script>

<div class="language-switcher">
    <button class:active={$locale === "fr"} on:click={() => setLocale("fr")}
        >FR</button
    >
    <button class:active={$locale === "mg"} on:click={() => setLocale("mg")}
        >MG</button
    >
</div>

<style>
    .language-switcher {
        display: flex;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 2px;
    }

    button {
        background: none;
        border: none;
        color: var(--on-primary);
        padding: 4px 8px;
        font-size: 0.8rem;
        cursor: pointer;
        border-radius: 18px;
        opacity: 0.7;
        font-weight: bold;
    }

    button.active {
        background: rgba(255, 255, 255, 0.9);
        color: var(--primary-color);
        opacity: 1;
    }
</style>
