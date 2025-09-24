<script setup>
    import { nextTick, onMounted, onUnmounted, ref } from 'vue'
    import ExecSelect from '@/components/exec/ExecSelect.vue'
    import ExecTimer from '@/components/exec/ExecTimer.vue'

    const timer = ref(null)
    const timerKey = ref(0)
    function solveComplete() {
        timer.value.setScramble(possiblePairs[Math.floor(Math.random() * possiblePairs.length)])
    }

    const select = ref(null)
    function updatePossiblePairs(newPairs) {
        possiblePairs = newPairs
        nextTick(() => {
            timer.value.setScramble(possiblePairs[Math.floor(Math.random() * possiblePairs.length)])
        })
    }
    let possiblePairs = []

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
