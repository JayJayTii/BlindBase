<script setup>
    import { ref } from 'vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'
    import ReconCreateNotation from '@/components/recons/ReconCreateNotation.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { GetInspectionMoves, GenerateReconBody, GetReconMoveCount } from '@/helpers/reconstruct.js'
    import { getSolveTimeString } from '@/helpers/timer.js'

    import { useSettingsStore } from '@/stores/SettingsStore.js'
    useSettingsStore().loadState()
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const props = defineProps({
        scramble: Sequence,
    })
    let scrambleStr = props.scramble.toString()
    if (useSettingsStore().settings.misc_widemovetype == 0) 
        scrambleStr = scrambleStr.replace(/[rufldb]/g, match => match.toUpperCase() + "w")

    const stage = ref(0)

    let inspectionCube = new FaceletCube()
    inspectionCube.TurnSequence(props.scramble)
    const inspectionSolution = ref(GetInspectionMoves(inspectionCube))

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
            inspection: inspectionSolution.value,
            letters: letterSolution.value,
            notation: notationSolution.value,
        }
        let reconSolve = ""
        //Only use the stored solve if its not an old scramble
        if (sessionStorage.reconstructionSolve) {
            reconSolve = JSON.parse(sessionStorage.reconstructionSolve)
            const reconScramble = new Sequence()
            reconScramble.setAlgorithmNotation(newRecon.scramble)
            if (newRecon.scramble == reconScramble.toString()) {
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

    function revertToLetterSelection() {
        letterSolution.value = [[], []]
        stage.value = 0
    }
</script>

<template>
    <div id="scrambleText" title="Scramble">
        {{scrambleStr}}
    </div>
    <ReconCreateLetters v-if="stage === 0"
                        :scramble="props.scramble" 
                        @lettersFinished="lettersFinished" />
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