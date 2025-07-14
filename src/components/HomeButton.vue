<script setup>
    defineProps({
        route: Object
    })
</script>

<template>
    <RouterLink :to="route.path" class="home-button">
        <div class="button">
            {{route.name}}
            <img src="@/assets/placeholder.png" />
        </div>
        <div class="description">
            {{route.meta.description}}
        </div>
    </RouterLink>
</template>

<style>
    .home-button {
        display: flex;
        flex-direction: column;
        max-height: 150px;
    }

        .home-button:hover .description {
            transform: translateY(-50px);
        }

    .button {
        display: inline-flex;
        background-color: lightgray;
        border: none;
        border-radius: 10px;
        min-width: 150px;
        min-height: 150px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 40px;
        z-index: 5;
    }
    .button img {
        min-width: 120px;
        min-height: 100px;
        max-height: 100px;
        display: block;
    }

    .description {
        display: inline-flex;
        background-color: dimgray;
        border: none;
        border-radius: 10px;
        min-height: 150px;
        max-width: 150px;
        font-size: 20px;
        text-align: center;
        justify-content: center;
        padding-top: 50px;
        line-height: 1.1;
        transform: translateY(-150px);
        transition: transform 0.5s ease;
    }

</style>