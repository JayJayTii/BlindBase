<script setup>
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'
    import { Sequence } from '@/helpers/sequence.js'
    const props = defineProps({
        scramble: Sequence,
    })
</script>

<template>
    <div id="scrambleText">
        {{props.scramble}}
    </div>
    <ReconCreateLetters :scramble="props.scramble" />
</template>

<style>
    #scrambleText{
        font-size: 4rem;
        color: var(--grey-100);
    }
</style>