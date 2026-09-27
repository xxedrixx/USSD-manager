<script>
    import { icons } from "../lib/icons";

    export let name;
    export let filled = false;
    export let size = 24;

    $: paths = icons[name] || [];
    $: d = (filled && paths[1]) || paths[0];
</script>

<svg
    class="icon"
    width={size}
    height={size}
    viewBox="0 -960 960 960"
    fill="currentColor"
    aria-hidden="true"
>
    <path {d} />
</svg>

<style>
    .icon {
        display: block;
        flex-shrink: 0;
    }
</style>
