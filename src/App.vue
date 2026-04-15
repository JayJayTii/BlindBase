<script setup>
    import { ref, provide } from 'vue'
    import { RouterView } from 'vue-router'
    import ConfirmationBox from '@/components/ConfirmationBox.vue'
    import { useSettingsStore } from '@/stores/SettingsStore.js'
    useSettingsStore().loadState()
    import Navbar from '@/components/Navbar.vue'
    import Footer from '@/components/Footer.vue'
    
    const confirmDialog = ref()
    provide('confirmDialog', confirmDialog)
</script>

<template>
    <ConfirmationBox ref="confirmDialog" />

    <el-container>
        <el-header>
            <Navbar />
        </el-header>

        <el-main style="overflow-y: auto; height: calc(100vh - var(--navbar-height) - var(--footer-height));">
            <RouterView :key="$route.fullPath" />
        </el-main>

        <el-footer>
            <div style="position: fixed; bottom: 0px; left: 0px; width: 100%;">
                <Footer />
            </div>
        </el-footer>
    </el-container>
</template>
