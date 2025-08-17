<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
    import { useTimerStore } from '../stores/TimerStore';
    const timerStore = useTimerStore();
    timerStore.loadState();
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
        else if (event.code === "ArrowRight") {
            if (solve.value.status < timerStore.solveStatuses.length - 1) {
                solve.value.status++
                timerStore.saveState()
            }
        }
        else if (event.code === "ArrowLeft") {
            if (solve.value.status > 0) {
                solve.value.status--
                timerStore.saveState()
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
        <div id="TimerCenterColumn">
            <div :class="['StopwatchText',
             timerStage === stages.waiting ? 'StopwatchStartSpaceDown' :
             timerStage === stages.stopping ? 'StopwatchEndSpaceDown' : '']"
                 :key="solve">
                {{timerStore.getSolveTimeStringFromSolve(solve.value)}}
            </div>
            <div class="RatioText" v-if="!isSolving && solve.value && solve.value.memoTime > 0">
                {{timerStore.getSolveRatioStringFromSolve(solve.value)}}
            </div>
            <div class="StatusRow" v-if="!isSolving && timerStage !== 1 && 'status' in solve.value">
                <template v-for="status in timerStore.solveStatuses">
                    <div :class="['ListItem', solve.value.status === status.id ? 'ListItemSelected' : 'ListItemUnselected']"
                         @click="solve.value.status = status.id;timerStore.saveState()">
                        {{status.name}}
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style>
    body {
        --timer-font-size: 7rem;
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
    #TimerCenterColumn {
        display: flex;
        flex-direction: column;
        position: absolute;
        left:50%;
        top:40%;
        transform: translate(-50%,-50%);
    }
    .StopwatchText {
        width: 100%;
        text-align: center;
        font-size: var(--timer-font-size);
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
    .StatusRow {
        display: grid;
        grid-template-columns: repeat(3, 70px);
        font-size: 1.5rem;
        align-self: center;
        text-align: center;
        color: var(--grey-100);
    }
    .StatusButton {
        background-color: var(--grey-600);
        border: 1px solid var(--panel-color);
        border-radius: 5px;
        color: var(--grey-100);
        cursor: pointer;
        font-size: 1rem;
    }
</style>
