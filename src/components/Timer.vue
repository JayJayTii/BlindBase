<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
    import { getSolveTimeString, getSolveRatioString } from '@/helpers/timer.js'

    const emit = defineEmits(['update:solve-complete'])
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
    const ratioTextSolve = reactive({})
    if (props.lastSolve)
        ratioTextSolve.value = props.lastSolve

    const isSolving = computed({
        get: () => timerStage.value === stages.memoing || timerStage.value === stages.executing
    })
    const solve = reactive({})
    if (props.lastSolve) {
        solve.value = props.lastSolve
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

        if (timerStage.value === stages.finished) {
            if (event.code === 'Space') {
                timerStage.value = stages.waiting //Wait for space up
                solve.value = {}
                solve.value.memoTime = 0
                solve.value.solveTime = 0
                solve.value.status = 0
                solve.value.scramble = scramble
            }
        }
        if (timerStage.value === stages.executing) { //Stop timer
            clearInterval(timerUpdate)
            solve.value.solveTime = new Date().getTime() - stopwatchStartTime
            solve.value.status = 0 //Default to no penalty
            timerStage.value = stages.stopping
            ratioTextSolve.value = solve.value
            emit('update:solve-complete', solve.value)
        }
    }
    function handleKeyup(event) {
        const el = document.activeElement
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

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

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        window.addEventListener('keyup', handleKeyup)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
        window.removeEventListener('keyup', handleKeyup)
    })

    defineExpose({
        setScramble,
        isSolving,
    })
</script>

<template>
    <div class="TimerContainer">
        <!---------SCRAMBLE---------->
        <div class="ScrambleText" v-if="!isSolving">
            {{scramble}}
        </div>

        <!---------MEMO/EXEC--------->
        <div class="StageText" v-if="isSolving && props.twoStage">{{timerStage === stages.memoing ? "MEMO" : "EXEC"}}</div>

        <div class="StopwatchContainer">
            <!------STOPWATCH------>
            <div :class="['StopwatchText',
            timerStage === stages.waiting ? 'StopwatchStartSpaceDown' :
            timerStage === stages.stopping ? 'StopwatchEndSpaceDown' : '']"
                 :key="solve">
                {{getSolveTimeString(solve.value)}}
            </div>
            <!---LAST SOLVE RATIO--->
            <div class="RatioText" v-if="!isSolving && ratioTextSolve.value && ratioTextSolve.value.hasOwnProperty('memoTime') && ratioTextSolve.value.memoTime > 0">
                {{getSolveRatioString(ratioTextSolve.value)}}
            </div>
        </div>
    </div>
</template>

<style>
    .StopwatchContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction:column;
        height: 70%;
    }

    .ScrambleText {
        width: 100%;
        text-align: center;
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0%);
        font-size: 2rem;
        color: var(--grey-100);
    }
    .StageText {
        width: 100%;
        text-align: center;
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0%);
        font-size: 6rem;
        font-weight: bold;
        color: var(--grey-100);
    }

    .StopwatchText {
        width: 100%;
        text-align: center;
        font-size: 7rem;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        color: var(--grey-100);
    }
    .StopwatchStartSpaceDown {
        color: var(--brand-200);
    }
    .StopwatchEndSpaceDown {
        color: var(--error-200);
    }

    .RatioText {
        width: 100%;
        font-size: 1.5rem;
        text-align: center;
        color: var(--grey-100);
    }
</style>