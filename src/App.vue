<script setup>
    import { ref, computed } from 'vue'
    import Home from './views/HomeView.vue'
    import Sheets from './views/SheetsView.vue'

    const routes = {
        '/': Home,
        '/sheets': Sheets
    }

    const currentPath = ref(window.location.hash)

    window.addEventListener('hashchange', () => {
        currentPath.value = window.location.hash
    })

    const currentView = computed(() => {
        return routes[currentPath.value.slice(1) || '/']
    })
</script>

<template>
    <a href="#/">Home</a> |
    <a href="#/sheets">Sheets</a> |
    <component :is="currentView" />
</template>