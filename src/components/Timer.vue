<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
    import { useTimerStore } from '../stores/TimerStore';
    const timerStore = useTimerStore();
    timerStore.loadState();
    import { formatTime } from '../helpers/timer.js';
    import { Scramble } from '../helpers/scramble.js';

    const props = defineProps({
        sessionID: Number,
    })
    const emit = defineEmits(['update:solve-complete'])

    const stages = {
        finished: 0,
        waiting: 1,
        memoing: 2,
        executing: 3,
        stopping: 4
    };
    const isSolving = computed({
        get: () => timerStage.value === stages.memoing || timerStage.value === stages.executing
    })
    const timerStage = ref(0)
    const solve = reactive({})
    solve.value = timerStore.sessions[timerStore.getSessionIndexWithID(props.sessionID)].solves.at(-1)
    if (!solve.value) {
        solve.value = {solveTime: 0}
    }
    let scramble = new Scramble(20).toString()
    let stopwatchStartTime = 0;

    let timerUpdate = null;
    function handleKeydown(event) {
        const el = document.activeElement;
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
                solve.value.dnf = false
            }
            else if (timerStage.value === stages.executing) { //Stop timer
                clearInterval(timerUpdate)
                solve.value.solveTime = new Date().getTime() - stopwatchStartTime
                solve.value.status = 0 //Default to no penalty
                timerStage.value = stages.stopping
                emit('update:solve-complete', solve.value)
                scramble = new Scramble(20).toString()
            }
        }
    }
    function handleKeyup(event) {
        const el = document.activeElement;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

        if (event.code === 'Space') {
            if (timerStage.value === stages.waiting) { //Begin timer
                timerStage.value = stages.memoing
                stopwatchStartTime = new Date().getTime()
                timerUpdate = setInterval(() => {
                    solve.value.solveTime = new Date().getTime() - stopwatchStartTime
                }, 10)
            }
            else if (timerStage.value === stages.memoing) { //Begin exec stage
                timerStage.value = stages.executing
                solve.value.memoTime = solve.value.solveTime
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
    defineExpose({

    })
</script>

<template>
    <div class="TimerContainer">
        <div class="ScrambleText" v-if="!isSolving">
            {{scramble}}
        </div>
        <div class="StageText" v-if="isSolving">{{timerStage === stages.memoing ? "MEMO" : "EXEC"}}</div>
        <div :class="['StopwatchText',
             timerStage === stages.waiting ? 'StopwatchStartSpaceDown' :
             timerStage === stages.stopping ? 'StopwatchEndSpaceDown' : '']"
             :key="solve">
            {{timerStore.getSolveTimeStringFromSolve(solve.value)}}
        </div>
        <div class="RatioText" v-if="!isSolving && solve.value && solve.value.memoTime > 0">
            {{timerStore.getSolveRatioStringFromSolve(solve.value)}}
        </div>
    </div>
</template>

<style>
    body {
        --timer-font-size: 8rem;
    }

    .TimerContainer{
        width: 100%;
        height: 100%;
        position: relative;
    }

    .ScrambleText {
        width:100%;
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
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        text-align:center;
        font-size: var(--timer-font-size);
        font-weight: bold;
        color: var(--grey-100);
    }
    .StopwatchStartSpaceDown {
        color: var(--brand-200);
    }
    .StopwatchEndSpaceDown {
        color: var(--error-200);
    }
    .RatioText {
        position: absolute;
        width: 100%;
        top: calc(44% + 0.5 * var(--timer-font-size));
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        text-align: center;
        color: var(--grey-100);
    }
</style>
