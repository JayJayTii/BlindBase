<script setup>
import { useRouter } from 'vue-router'
import { useSettingsStore } from '.././stores/SettingsStore'
import HomeButton from '@/components/HomeButton.vue'

const settingsStore = useSettingsStore()
settingsStore.loadState()

const router = useRouter()
const routes = router.getRoutes().filter((route) => route.meta.tool)
</script>

<template>
    <h1 class="title">BlindBase</h1>
    <div class="row">
        <HomeButton v-for="route in routes" :route="route" />
    </div>
</template>

<style>
.title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    height: 33vh;
    font-size: clamp(0px, 20vw, 20vh);
    color: var(--grey-100);
}

    .row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        overflow: hidden;
        align-items: start;
        gap: 15px;
    }
</style>
