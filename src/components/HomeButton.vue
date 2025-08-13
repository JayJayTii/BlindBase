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
:root {
    --square-size: 150px;
}

.home-button {
    display: flex;
    flex-direction: column;
}

    .home-button:hover .description {
        margin-top: calc(-0.3 * var(--square-size));
    }

    .button {
        width: var(--square-size);
        height: var(--square-size);
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
    height: calc(0.7 * var(--square-size));
    aspect-ratio: auto;
    display: flex;
}

    .description {
        background-color: var(--brand-500);
        color: var(--grey-800);
        border-radius: 10px;
        width: var(--square-size);
        min-height: var(--square-size);
        align-items: center;
        justify-content: start;
        display: flex;
        flex-direction: column;
        font-size: 20px;
        text-align: center;
        padding: 50px 10px 10px 10px;
        line-height: 1.1;
        margin-top: calc(-1 * var(--square-size));
        transition: margin-top 0.1s ease;
    }
</style>