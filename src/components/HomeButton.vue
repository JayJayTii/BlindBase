<script setup>
    defineProps({
        route: Object,
    })
</script>

<template>
    <RouterLink :to="route.path" class="home-button">
        <div class="button">
            <div style="background-color:transparent">{{route.name}}</div>
            <img :src="route.meta.iconPath"/>
        </div>
        <div class="description">
            {{route.meta.description}}
        </div>
    </RouterLink>
</template>

<style>
    :root{
        --square-size: 150px;
    }

    .home-button {
        display: flex;
        flex-direction: column;
        max-height: var(--square-size);
    }

        .home-button:hover .description {
            transform: translateY(-50px);
        }

    .button {
        background-color: var(--brand-600);
        color: var(--brand-900);
        border-radius: 10px;
        width: var(--square-size);
        min-height: var(--square-size);
        align-items: center;
        justify-content: start;
        display: flex;
        flex-direction: column;
        font-size: 40px;
        line-height: 1.1;
        z-index: 5;
    }
    .button img {
        max-height:100px;
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
        transform: translateY(calc(-1*var(--square-size)));
        transition: transform 0.1s ease;
    }

</style>