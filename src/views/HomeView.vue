<script setup>
    import { useRouter } from 'vue-router'
    import HomeButton from '@/components/HomeButton.vue'

    const router = useRouter()
    const routes = router.getRoutes().filter(route => route.meta.tool)
</script>

<template>
    <div class="title">
        BlindBase
    </div>
    <div class="row-container">
        <nav class="row">
            <HomeButton v-for="route in routes" :route="route"/>
        </nav>
    </div>
</template>

<style>

    .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: end;
        height: 40vh;
        font-size: 20vh;
    }

    .row-container {
        display: flex;
        justify-content: start;
        align-items: center;
        height: 60vh; 
        flex-direction: column;
    }

    .row {
        display: flex;
        justify-content: space-between; /* Even spacing between items */
        align-items: center; /* Vertically center items */
        flex-wrap: wrap; /* Optional: wrap to next line if needed */
        gap: 1rem; /* Optional: consistent spacing between items */
        padding: 1rem;
    }
</style>
