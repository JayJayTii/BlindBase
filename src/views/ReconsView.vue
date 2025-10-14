<script setup>
    import { useRoute } from 'vue-router'
    import { Sequence } from '@/helpers/sequence.js'
    import ReconSelect from '@/components/recons/ReconSelect.vue'
    import ReconEdit   from '@/components/recons/ReconEdit.vue'
    import ReconCreate from '@/components/recons/ReconCreate.vue'
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    reconsStore.loadState()

    const route = useRoute()
    const scramble = decodeURIComponent(route.params.pathMatch)
    const reconIndex = reconsStore.GetReconWithScramble(scramble)
    const newRecon = (scramble != "" && reconIndex == -1)

    const scrambleSequence = new Sequence()
    scrambleSequence.setAlgorithmNotation(scramble)
</script>

<template>
    <ReconCreate v-if="newRecon" :scramble="scrambleSequence"/>
    <ReconEdit v-else-if="reconIndex > -1" :reconIndex="reconIndex" />
    <ReconSelect v-else />
</template>