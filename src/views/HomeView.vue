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
    <div style="height: 100%;">
        <div style="text-align:center; color:var(--grey-100);">
            <div style="height:5vh" />
            <h1 id="title">BlindBase</h1>
            <p id="subtitle">The all-in-one tool for learning 3-Style</p>
            <div style="height:5vh" />
        </div>
        <!-- Home button for each valid route/tool -->
        <div class="row">
            <HomeButton v-for="route in routes" :route="route" />
        </div>
    </div>
</template>

<style>
    #title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 23vh;
        font-size: clamp(0px, 20vw, 20vh);
        color: var(--grey-100);
        user-select: none;
    }

    #subtitle {
        font-size: clamp(0px, 3vw, 3vh);
        user-select: none;
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
