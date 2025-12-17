<script setup>
    import { useRoute, useRouter } from 'vue-router'
    import { Sequence } from '@/helpers/sequence.js'
    import ReconSelect from '@/components/recons/ReconSelect.vue'
    import ReconEdit   from '@/components/recons/ReconEdit.vue'
    import ReconCreate from '@/components/recons/ReconCreate.vue'
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    reconsStore.loadState()

    const router = useRouter()
    const route = useRoute()
    const scramble = decodeURIComponent(route.params.pathMatch)
    const scrambleSequence = new Sequence()
    scrambleSequence.setAlgorithmNotation(scramble)
    //Only allow legitimate scrambles and avoids duplicates by checking it is the same once a sequence has corrected it
    if (scramble !== scrambleSequence.toString()) 
        router.replace(`/recons/${scrambleSequence.toString()}`)

    const reconIndex = reconsStore.GetReconWithScramble(scramble)
    const newRecon = (scramble != "" && reconIndex == -1)
</script>

<template>
    <!--Selects between creating, editing, and selecting a recon-->
    <ReconCreate v-if="newRecon" :scramble="scrambleSequence" />
    <ReconEdit v-else-if="reconIndex > -1" :reconIndex="reconIndex" />
    <ReconSelect v-else />
</template>