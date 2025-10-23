<script setup>
    import { nextTick, onMounted, onUnmounted, ref } from 'vue'
    import ExecSelect from '@/components/exec/ExecSelect.vue'
    import Timer from '@/components/Timer.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation } from '@/helpers/recommendations.js'
    import { scramblers } from '@/helpers/solver/scramble_333_edit.js'
    import { useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    //WHY DOES THIS WORK???
    setTimeout(() => {
        scramblers['333'].initialize(null, Math)
    }, 0)
    
    let fullScramble = false
    let possiblePairs = []
    let pieceType = 0
    let useScramble = false

    const timer = ref(null)
    const timerKey = ref(0)
    function solveComplete() {
        if (fullScramble) {
            const scramble = (pieceType === 1) ? scramblers['333'].getCornerScramble() : scramblers['333'].getEdgeScramble()
            timer.value.setScramble(scramble)
            return
        }

        const pair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)]
        if (!useScramble) {
            console.log("Setting from " + possiblePairs)
            timer.value.setScramble(pair)
            return
        }

        //Generate a scramble
        const solution = GetRandomRecommendation(pieceType, pair)
        let scramble = new Sequence()
        scramble.setAlgorithmNotation(solution)
        scramble.reverse()
        timer.value.setScramble(scramble.toString())
    }

    const select = ref(null)
    function updatePossiblePairs(newFullScramble, newPairs, newPieceType, newUseScramble) {
        fullScramble = newFullScramble
        possiblePairs = newPairs
        console.log("new pairs " + newPairs)
        pieceType = newPieceType
        useScramble = newUseScramble
        nextTick(() => {
            if(!timer.value)
                return
            solveComplete()
        })
    }

    function selectionFinished() {
        return select.value ? select.value.selectionFinished : false
    }
</script>

<template>
    <ExecSelect ref="select" :key="settingsStore.settings.sheets_pairorder" 
                @update:on-selected="updatePossiblePairs"/>

    <Timer v-if="selectionFinished()"
               :key="timerKey"
               ref="timer"
               @update:solve-complete="solveComplete" 
               style="height: 83vh;"/>
</template>
