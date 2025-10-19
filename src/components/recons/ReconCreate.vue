<script setup>
    import { ref } from 'vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'
    import ReconCreateNotation from '@/components/recons/ReconCreateNotation.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { GenerateReconBody, GetReconMoveCount } from '@/helpers/reconstruct.js'
    import { getSolveTimeString } from '@/helpers/timer.js'

    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const props = defineProps({
        scramble: Sequence,
    })
    const stage = ref(0)

    const letterSolution = ref([[],[]]) //First array is edges, second is corners
    function lettersFinished(_letterSolution) {
        letterSolution.value = _letterSolution
        stage.value++
    }

    const notationSolution = ref({})
    function notationFinished(_notationSolution) {
        notationSolution.value = _notationSolution
        stage.value++
        let newRecon = {
            name: "Untitled",
            scramble: props.scramble.toString(),
            letters: letterSolution.value,
            notation: notationSolution.value,
        }
        let reconSolve = ""
        //Only use the stored solve if its not an old scramble
        if (sessionStorage.reconstructionSolve) {
            reconSolve = JSON.parse(sessionStorage.reconstructionSolve)
            if (newRecon.scramble == reconSolve.scramble) {
                newRecon.solve = sessionStorage.reconstructionSolve
                newRecon.name += " " + getSolveTimeString(reconSolve)
            }
        }
        sessionStorage.removeItem('reconstructionSolve') //Remove no matter what

        newRecon.body = GenerateReconBody(newRecon)
        const newReconIndex = reconsStore.createRecon(newRecon)

        router.replace(`/recons`).then(() => {
            router.push(`/recons/${props.scramble.toString()}`)
        })
    }

    function revertToReconPage() {
        router.push(`/recons`)
    }
    function revertToLetterSelection() {
        letterSolution.value = [[], []]
        stage.value = 0
    }
</script>

<template>
    <div id="scrambleText">
        {{props.scramble}}
    </div>
    <ReconCreateLetters v-show="stage === 0"
                        :scramble="props.scramble" 
                        @lettersFinished="lettersFinished"
                        @revertToReconPage="revertToReconPage"/>
    <ReconCreateNotation v-if="stage === 1"
                         :scramble="props.scramble"
                         :letterSolution="letterSolution"
                         @notationFinished="notationFinished"
                         @revertToLetterSelection="revertToLetterSelection"/>
</template>

<style>
    #scrambleText{
        font-size: 3rem;
        color: var(--grey-100);
        border-block-end: 4px solid var(--grey-100);
    }

    .ReconHeader {
        color: var(--grey-100);
        font-size: 2rem;
        display: flex;
        flex-direction: row;
    }
</style>