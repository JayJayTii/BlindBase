<script setup>
    import { ref } from 'vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'
    import ReconCreateNotation from '@/components/recons/ReconCreateNotation.vue'
    import { Sequence } from '@/helpers/sequence.js'
    const props = defineProps({
        scramble: Sequence,
    })

    const stage = ref(0)

    const letterSolution = ref([[],[]]) //First array is edges, second is corners
    function lettersFinished(_letterSolution) {
        letterSolution.value = _letterSolution
        stage.value++
    }
</script>

<template>
    <div id="scrambleText">
        {{props.scramble}}
    </div>
    <ReconCreateLetters v-if="stage === 0"
                        :scramble="props.scramble" 
                        @lettersFinished="lettersFinished"/>
    <ReconCreateNotation v-if="stage === 1"
                         :scramble="props.scramble"
                         :letterSolution="letterSolution"/>
</template>

<style>
    #scrambleText{
        font-size: 3rem;
        color: var(--grey-100);
        border-block-end: 4px solid white;
    }

    .ReconHeader {
        color: var(--grey-100);
        font-size: 2rem;
        display: flex;
        flex-direction: row;
    }
</style>