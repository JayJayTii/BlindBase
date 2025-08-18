<script setup>
    defineProps({
        route: Object,
    })
</script>

<template>
    <RouterLink :to="route.path" class="home-button">
        <div class="button">
            <div style="background-color: transparent">{{ route.name }}</div>
            <img :src="route.meta.iconPath" />
        </div>
        <div class="description">
            {{ route.meta.description }}
        </div>
    </RouterLink>
</template>

<style>
    .home-button {
        --home-button-size: 150px;
        display: flex;
        flex-direction: column;
    }
    .home-button:hover .description {
        margin-top: calc(-0.3 * var(--home-button-size));
    }

    .button {
        width: var(--home-button-size);
        height: var(--home-button-size);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        font-size: 40px;
        line-height: 1.1;
        background-color: var(--brand-600);
        color: var(--brand-900);
        border-radius: 10px;
        z-index: 5;
    }
        .button img {
            height: calc(0.7 * var(--home-button-size));
            aspect-ratio: auto;
            display: flex;
        }

    /*
        Descriptions are hidden behind the button by default,
        then peek out when hovered by interpolating margin-top
    */
    .description {
        background-color: var(--brand-500);
        color: var(--grey-800);
        border-radius: 10px;
        width: var(--home-button-size);
        min-height: var(--home-button-size);
        align-items: center;
        justify-content: start;
        display: flex;
        flex-direction: column;
        font-size: 20px;
        text-align: center;
        padding: 50px 10px 10px 10px;
        line-height: 1.1;
        margin-top: calc(-1 * var(--home-button-size));
        transition: margin-top 0.1s ease;
    }
</style>