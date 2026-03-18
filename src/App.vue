<script setup>
    import { ref, provide } from 'vue'
    import { RouterView } from 'vue-router'
    import ConfirmationBox from '@/components/ConfirmationBox.vue'
    import Navbar from '@/components/Navbar.vue'
    
    const confirmDialog = ref()
    provide('confirmDialog', confirmDialog)
</script>

<template>
    <ConfirmationBox ref="confirmDialog" />
    <Navbar />
    <!--Vue handles routing, routes are defined in routers/index.js-->
    <div style="height: calc(100vh - var(--navbar-height)); overflow: auto;" >
        <RouterView :key="$route.fullPath"/>
    </div>
</template>
