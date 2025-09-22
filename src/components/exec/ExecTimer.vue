<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
    import { getSolveTimeString } from '@/helpers/timer.js'

    const emit = defineEmits(['update:solve-complete'])
    defineExpose({
        setScramble
    })
    const props = defineProps({
        lastSolve: Object,
        twoStage: Boolean,
    })

    const stages = {
        finished: 0,
        waiting: 1,
        memoing: 2,
        executing: 3,
        stopping: 4
    }
    const timerStage = ref(0)

    const isSolving = computed({
        get: () => timerStage.value === stages.memoing || timerStage.value === stages.executing
    })
    const solve = reactive({})
    if (props.lastSolve) {
        solve = props.lastSolve
    }
    else {
        solve.value = { solveTime: 0 } //Initialise timer to 0.00 if this is the first solve
    }

    const scramble = ref("")
    function setScramble(newScramble) {
        scramble.value = newScramble
    }

    let stopwatchStartTime = 0
    let timerUpdate = null
    function handleKeydown(event) {
        const el = document.activeElement
        //Don't start timer if typing a keybind as text
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

        if (event.code === 'Space') {
            if (timerStage.value === stages.finished) {
                timerStage.value = stages.waiting //Wait for space up
                solve.value = {}
                solve.value.memoTime = 0
                solve.value.solveTime = 0
                solve.value.status = 0
                solve.value.scramble = scramble
            }
            else if (timerStage.value === stages.executing) { //Stop timer
                clearInterval(timerUpdate)
                solve.value.solveTime = new Date().getTime() - stopwatchStartTime
                solve.value.status = 0 //Default to no penalty
                timerStage.value = stages.stopping
                emit('update:solve-complete', solve.value)
            }
        }
    }
    function handleKeyup(event) {
        const el = document.activeElement
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

        if (event.code === 'Space') {
            if (timerStage.value === stages.waiting) { //Begin timer
                timerStage.value = props.twoStage ? stages.memoing : stages.executing
                stopwatchStartTime = new Date().getTime()
                //Update the stopwatch text every 0.01 seconds
                timerUpdate = setInterval(() => {
                    solve.value.solveTime = new Date().getTime() - stopwatchStartTime
                }, 10) 
            }
            else if (timerStage.value === stages.memoing) { //Begin exec stage
                timerStage.value = stages.executing
                solve.value.memoTime = solve.value.solveTime //Copy current time into memoTime
            }
            else if (timerStage.value === stages.stopping) { //Go back to default screen
                timerStage.value = stages.finished
            }
        }
    }
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        window.addEventListener('keyup', handleKeyup)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
        window.removeEventListener('keyup', handleKeyup)
    })
</script>

<template>
    <div class="TimerContainer">
        <!---------SCRAMBLE---------->
        <div class="ScrambleText" v-if="!isSolving">
            {{scramble}}
        </div>

        <div class="StopwatchContainer">
            <!------STOPWATCH------>
            <div :class="['StopwatchText',
         timerStage === stages.waiting ? 'StopwatchStartSpaceDown' :
         timerStage === stages.stopping ? 'StopwatchEndSpaceDown' : '']"
                 :key="solve">
                {{getSolveTimeString(solve.value)}}
            </div>
        </div>
    </div>
</template>

<style>
    .StopwatchContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 70%;
    }
</style>