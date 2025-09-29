<script setup>
    import { useRoute } from 'vue-router'
    import { Sequence } from '@/helpers/sequence.js'
    import ReconSelect from '@/components/recons/ReconSelect.vue'
    import ReconCreate from '@/components/recons/ReconCreate.vue'

    const route = useRoute()
    const scramble = decodeURIComponent(route.params.pathMatch)
    const newRecon = (scramble != "") //Also add checking if recon aleady exists for scramble

    const scrambleSequence = new Sequence()
    scrambleSequence.setAlgorithmNotation(scramble)
</script>

<template>
    <ReconCreate v-if="newRecon" :scramble="scrambleSequence" />
    <ReconSelect v-else />
</template>