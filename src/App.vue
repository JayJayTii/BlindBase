<script setup>
    import { ref, provide } from 'vue'
    import { RouterView } from 'vue-router'
    import { useSettingsStore } from '@/stores/SettingsStore.js'
    useSettingsStore().loadState()
    import Navbar from '@/components/Navbar.vue'
</script>

<template>
    <div style="min-height: 100dvh; display: flex; flex-direction: column;">
        <el-header style="position: sticky; top: 0; z-index: 10;">
            <Navbar />
        </el-header>
        <el-main>
            <RouterView :key="$route.fullPath" />
        </el-main>
        <hr />
        <el-footer style="height: var(--footer-height);">
            <div><el-link underline="always" href="https://www.youtube.com/@BlindBase" target="_blank">YouTube</el-link></div>
            <div><el-link underline="always" href="https://github.com/JayJayTii/BlindBase" target="_blank">GitHub</el-link></div>
            <div><el-link underline="always" href="https://www.worldcubeassociation.org/persons/2018TUPP02" target="_blank">Created by James Tuppenney</el-link></div>
            <div><el-link underline="always" href="/donate/">Donate</el-link></div>
        </el-footer>
    </div>
</template>

<style>
    .el-footer {
        margin-top: auto;
        display: grid;
        grid-template-columns: repeat(4, auto);
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 60px;
        padding-bottom: 10px;
    }
</style>