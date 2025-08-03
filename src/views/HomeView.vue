<script setup>
    import { useRouter } from 'vue-router'
    import { useSettingsStore } from ".././stores/SettingsStore";
    import HomeButton from '@/components/HomeButton.vue'

    const settingsStore = useSettingsStore();
    settingsStore.loadState();

    const router = useRouter()
    const routes = router.getRoutes().filter(route => route.meta.tool)
</script>

<template>
    <div class="title">
        <h1>BlindBase</h1>
    </div>
    <nav class="row">
        <HomeButton v-for="route in routes" :route="route"/>
    </nav>
</template>

<style>

    .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: end;
        height: 33vh;
        font-size: 11vh;
        color: var(--grey-100);
    }

    .row {
        height: 60vh;
        display: flex;
        justify-content: center;
        align-items: start;
        gap: 15px;
    }
</style>
