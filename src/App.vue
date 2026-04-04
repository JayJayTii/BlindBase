<script setup>
    import { ref, provide } from 'vue'
    import { RouterView } from 'vue-router'
    import ConfirmationBox from '@/components/ConfirmationBox.vue'
    import Navbar from '@/components/Navbar.vue'
    import Footer from '@/components/Footer.vue'
    
    const confirmDialog = ref()
    provide('confirmDialog', confirmDialog)
</script>

<template>
    <ConfirmationBox ref="confirmDialog" />

    <div style="display: flex; flex-direction: column; height: 100vh;">
        <Navbar />

        <!--Vue handles routing, routes are defined in routers/index.js-->
        <div style="overflow-y: auto; height: calc(100vh - var(--navbar-height) - var(--footer-height));">
            <RouterView :key="$route.fullPath" />
        </div>

        <div style="position: fixed; bottom: 0px; left: 0px; width: 100%;">
            <Footer />
        </div>
    </div>
</template>
