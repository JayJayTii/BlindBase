<script setup>
    import { nextTick, onMounted, onUnmounted, ref } from 'vue'
    import ExecSelect from '@/components/exec/ExecSelect.vue'
    import ExecTimer from '@/components/exec/ExecTimer.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation } from '@/helpers/recommendations.js'
    import { scramblers } from '@/helpers/solver/scramble_333_edit.js'

    scramblers['333'].initialize(null, Math);

    let possiblePairs = []
    let pieceType = 0
    let useScramble = false

    const timer = ref(null)
    const timerKey = ref(0)
    function solveComplete() {
        const pair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)]
        if (!useScramble) {
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
    function updatePossiblePairs(newPairs, newPieceType, newUseScramble) {
        possiblePairs = newPairs
        pieceType = newPieceType
        useScramble = newUseScramble

        if (newPairs == []) 
            return
        nextTick(() => {
            if(!timer.value)
                return
            solveComplete()
        })
    }

    function selectionFinished() {
        return select.value ? select.value.selectionFinished() : false
    }
</script>

<template>
    <ExecSelect ref="select" @update:on-selected="updatePossiblePairs"/>

    <ExecTimer v-if="selectionFinished()"
               :key="timerKey"
               ref="timer"
               @update:solve-complete="solveComplete" 
               style="height: 83vh;"/>
</template>
