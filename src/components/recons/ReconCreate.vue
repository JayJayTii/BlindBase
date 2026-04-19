<script setup>
    //Handles the creation of a reconstruction for each stage
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
            cornerBuffer: useSettingsStore().settings.misc_defaultcornerbuffer,
            edgeBuffer: useSettingsStore().settings.misc_defaultedgebuffer,
        }
        let reconSolve = ""
        //Only use the stored solve if its not an old scramble
        if (sessionStorage.reconstructionSolve) {
            reconSolve = JSON.parse(sessionStorage.reconstructionSolve)
            const reconScramble = new Sequence()
            reconScramble.fromAlgorithmNotation(newRecon.scramble)
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

    function back() {
        if (stage.value == 0) {
            history.back()
        }
        else if (stage.value == 1) {
            letterSolution.value = [[], []]
            stage.value = 0
        }
    }
</script>

<template>

    <div style="border-block-end: 1px solid var(--el-border-color); padding-bottom: 10px; display: flex; flex-direction: row; align-items: center; gap: 5px;">
        <el-tooltip content="Back">
            <el-button @click="back()" style="width: 40px; height: 28px;" type="primary" :plain="true">
                <el-icon :size="20"><DArrowLeft /></el-icon>
            </el-button>
        </el-tooltip>
        <el-text style="font-size: 2.2rem; padding-bottom: 5px;">{{scrambleStr}}</el-text>
    </div>
    <ReconCreateLetters v-if="stage === 0"
                        :scramble="props.scramble"
                        :cornerBuffer="useSettingsStore().settings.misc_defaultcornerbuffer"
                        :edgeBuffer="useSettingsStore().settings.misc_defaultedgebuffer"
                        @lettersFinished="lettersFinished" />
    <ReconCreateNotation v-if="stage === 1"
                         :scramble="props.scramble"
                         :letterSolution="letterSolution"
                         :cornerBuffer="useSettingsStore().settings.misc_defaultcornerbuffer"
                         :edgeBuffer="useSettingsStore().settings.misc_defaultedgebuffer"
                         @notationFinished="notationFinished" />
</template>

<style>
    .ReconHeader {
        font-size: 2rem;
        display: flex;
        flex-direction: row;
    }
</style>