<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
    import { getSolveTimeString, getSolveRatioString } from '@/helpers/timer.js'
    import { useSettingsStore } from '@/stores/SettingsStore.js'

    const emit = defineEmits(['update:solve-complete'])
    const props = defineProps({
        lastSolve: Object,
        twoStage: Boolean,
        clearOnSolved: Boolean,
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

    const scramble = ref("")
    function setScramble(newScramble) {
        scramble.value = newScramble
    }

    function refresh() {
        if (props.lastSolve)
            solve.value = props.lastSolve
        else
            solve.value = { solveTime: 0 } //Initialise timer to 0.00 if this is the first solve
    }
    refresh()

    let stopwatchStartTime = 0
    let timerUpdate = null
    let acceptSpaceInput = true
    let currentKeyPressed = "" //Avoids confusion when pressing two keys at once to progress the timer
    let waitingBeforeExec = false
    let waitingTimeStart = 0
    const stopwatchKey = ref(0) //just so the yellow turns to green when holding space
    function handleKeydown(event) {
        const el = document.activeElement
        //Don't start timer if typing a keybind as text
        if (!acceptSpaceInput || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName == "SELECT" || el.isContentEditable)
            return

        if (timerStage.value === stages.finished) {
            if (event.code === 'Space' || event.code === 'Mouse0') {
                timerStage.value = stages.waiting //Wait for space up
                waitingTimeStart = Date.now()
                setTimeout(() => { stopwatchKey.value++ }, 1000 * useSettingsStore().settings.timer_spaceholdingtime)
                solve.value = {}
                solve.value.memoTime = 0
                solve.value.solveTime = 0
                solve.value.status = 0
                solve.value.scramble = scramble
            }
        }
        if (timerStage.value === stages.memoing && currentKeyPressed == "") { //Wait for key up to start exec stage
            currentKeyPressed = event.code
            waitingBeforeExec = true
            stopwatchKey.value++
        }
        if (timerStage.value === stages.executing && currentKeyPressed == "") { //Stop timer
            currentKeyPressed = event.code
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
        if (!acceptSpaceInput || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName == "SELECT" || el.isContentEditable)
            return

        if (timerStage.value === stages.waiting) { //Begin timer
            if (Date.now() - waitingTimeStart > 1000 * useSettingsStore().settings.timer_spaceholdingtime) {
                timerStage.value = props.twoStage ? stages.memoing : stages.executing
                stopwatchStartTime = new Date().getTime()
                //Update the stopwatch text every 0.01 seconds
                timerUpdate = setInterval(() => {
                    solve.value.solveTime = new Date().getTime() - stopwatchStartTime
                }, 10)
            }
            else {
                timerStage.value = stages.finished
            }
        }
        else if (event.code == currentKeyPressed && timerStage.value === stages.memoing) { //Begin exec stage
            currentKeyPressed = ""
            waitingBeforeExec = false
            timerStage.value = stages.executing
            solve.value.memoTime = solve.value.solveTime //Copy current time into memoTime
        }
        else if (event.code == currentKeyPressed && timerStage.value === stages.stopping) { //Go back to default screen
            currentKeyPressed = ""
            timerStage.value = stages.finished
            if (props.clearOnSolved)
                solve.value.solveTime = 0
            //Don't accept new spacebar presses for a bit after ending a solve just in case
            acceptSpaceInput = false
            setTimeout(() => {
                acceptSpaceInput = true
            }, 1000)
        }
    }
    function mouseDown(event) {
        event.code = "Mouse" + event.button
        handleKeydown(event)
    }
    function mouseUp(event) {
        event.code = "Mouse" + event.button
        handleKeyup(event)
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
        refresh,
        isSolving,
        timerStage,
    })

    function getStopwatchCSSclasses() {
        const out = ['StopwatchText']
        if (waitingBeforeExec || (timerStage.value == stages.waiting && Date.now() - waitingTimeStart >= 1000 * useSettingsStore().settings.timer_spaceholdingtime))
            out.push('StopwatchStartSpaceDown')
        else if (timerStage.value == stages.waiting && Date.now() - waitingTimeStart < 1000 * useSettingsStore().settings.timer_spaceholdingtime)
            out.push('StopwatchStartYellow')
        else if (timerStage.value == stages.stopping)
            out.push('StopwatchEndSpaceDown')
        return out
    }
</script>

<template>
    <div id="TimerContainer" @mousedown="mouseDown" @mouseup="mouseUp" style="position:relative;cursor:pointer;">
        <!---------SCRAMBLE---------->
        <div class="ScrambleText" v-if="!isSolving">
            {{scramble}}
        </div>

        <!---------MEMO/EXEC--------->
        <div :class="['StageText', waitingBeforeExec ? 'StopwatchStartSpaceDown' : '']" v-if="isSolving && props.twoStage">
            {{timerStage === stages.memoing ? "MEMO" : "EXEC"}}
        </div>

        <div class="StopwatchContainer">
            <!------STOPWATCH------>
            <div :class="getStopwatchCSSclasses()"
                 :key="solve + stopwatchKey">
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
        position: absolute;
        transform: translate(-50%, 0%);
        width: 100%;
        text-align: center;
        left: 50%;
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
        position:absolute;

    }
    .StopwatchStartYellow {
        color: var(--warn-300);
    }
    .StopwatchStartSpaceDown {
        color: var(--brand-300);
    }
    .StopwatchEndSpaceDown {
        color: var(--error-300);
    }

    .RatioText {
        width: 100%;
        font-size: 1.5rem;
        text-align: center;
        color: var(--grey-100);
        position: absolute;
        transform:translate(0%,5rem);
    }
</style>