<script setup>
    import { useRoute } from 'vue-router'
    import ReconSelect from '@/components/recons/ReconSelect.vue'
    import ReconCreate from '@/components/recons/ReconCreate.vue'

    const route = useRoute()
    const algorithm = decodeURIComponent(route.params.catchAll)
    const newRecon = (algorithm != 'undefined') //Also add checking if recon aleady exists for scramble
</script>

<template>
    <ReconCreate v-if="newRecon" />
    <ReconSelect v-else />
</template>