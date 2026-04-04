<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
    import { getSolveTimeString, getSolveRatioString } from '@/helpers/timer.js'
    import { useSettingsStore } from '@/stores/SettingsStore.js'
    useSettingsStore().loadState()

    const emit = defineEmits(['update:solve-complete'])
    const props = defineProps({
        lastSolve: Object,
        twoStage: Boolean,
    })

    //Goes through one stage at a time during an attempt
    const stages = {
        finished: 0,
        waiting: 1,
        memoing: 2,
        executing: 3,
        stopping: 4
    }
    const timerStage = ref(0)

    const ratioTextSolve = reactive([]) //Contains the previous solve that memo : exec ratio shows
    if (props.lastSolve)
        ratioTextSolve.value = props.lastSolve

    const isSolving = computed({
        get: () => timerStage.value === stages.memoing || timerStage.value === stages.executing
    })

    const scramble = ref("")
    function setScramble(newScramble) {
        scramble.value = newScramble
    }

    //Data for the solve is filled in over the course of an attempt
    //Solve = [solveTime, memoTime, status, scramble]
    const solve = reactive([])
    function refresh() {
        if (props.lastSolve)
            solve.value = props.lastSolve
        else
            solve.value = [0, 0, 0, ""] //Initialise timer to 0.00 if this is the first solve
    }
    refresh()

    let stopwatchStartTime = 0 //Current length of the solve is the current time - stopwatchStartTime
    let timerUpdate = null //Holds the interval which updates the stopwatch
    let acceptSpaceInput = true //Space input is blocked for a period after a solve to prevent restarting
    let currentKeyPressed = "" //Avoids confusion when pressing two keys at once to progress the timer
    let waitingBeforeExec = false //Kind of a bodge to avoid adding an extra stage in the middle of the current ones
    let waitingTimeStart = 0 //Keeps track of how long space has been held before starting an attempt
    let spacePressed = false
    const stopwatchKey = ref(0) //just so the yellow turns to green when holding space
    function handleKeydown(event) {
        if(event.code === 'Space') 
            spacePressed = true;

        //Don't start timer if typing a keybind as text
        const el = document.activeElement
        if (!acceptSpaceInput || scramble.value == '' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

        if (timerStage.value === stages.finished && event.code === 'Space')
            BeginWaiting()
        else if (timerStage.value === stages.memoing && currentKeyPressed == "")
            EndMemo()
        else if (timerStage.value === stages.executing && currentKeyPressed == "")
            StopTimer()
    }
    function handleKeyup(event) {
        if(event.code === 'Space')
            spacePressed = false
        
        const el = document.activeElement
        if (!acceptSpaceInput || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

        if (timerStage.value === stages.waiting)
            EndWaiting()
        else if (timerStage.value === stages.memoing)
            BeginExec()
        else if (timerStage.value === stages.stopping)
            FinishTimer()
    }

    function BeginWaiting() {
        timerStage.value = stages.waiting //Wait for space up
        waitingTimeStart = Date.now()
        setTimeout((thisStartTime) => {
            if(spacePressed && thisStartTime == waitingTimeStart) {
                stopwatchKey.value++
                solve.value = [0, 0, 0, scramble.value]
            }
        }, 1000 * useSettingsStore().settings.timer_spaceholdingtime, waitingTimeStart)
    }
    function EndWaiting() {
        if (Date.now() - waitingTimeStart > 1000 * useSettingsStore().settings.timer_spaceholdingtime) {
            timerStage.value = props.twoStage ? stages.memoing : stages.executing
            stopwatchStartTime = new Date().getTime()
            //Update the stopwatch text every 0.01 seconds
            timerUpdate = setInterval(() => {
                solve.value[0] = new Date().getTime() - stopwatchStartTime //set solve time
            }, 10)
        }
        else {
            timerStage.value = stages.finished // Cancel timer start
        }
    }
    function EndMemo() {
        currentKeyPressed = event.code
        waitingBeforeExec = true
        stopwatchKey.value++
    }
    function BeginExec() {
        currentKeyPressed = ""
        waitingBeforeExec = false
        timerStage.value = stages.executing
        solve.value[1] = solve.value[0] // Copy current solve time into memoTime
    }
    function StopTimer() {
        currentKeyPressed = event.code
        clearInterval(timerUpdate)
        solve.value[0] = new Date().getTime() - stopwatchStartTime //Solve time
        solve.value[2] = 0 //Status, default to no penalty
        timerStage.value = stages.stopping
        ratioTextSolve.value = solve.value
        emit('update:solve-complete', solve.value)
    }
    function FinishTimer() {
        currentKeyPressed = ""
        timerStage.value = stages.finished
        //Don't accept new spacebar presses for a bit after ending a solve just in case
        acceptSpaceInput = false
        setTimeout(() => {
            acceptSpaceInput = true
        }, 500)
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
        //Gets the current CSS classes that the stopwatch should belong to
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
    <div id="TimerContainer" style="position:relative;">
        <!---------SCRAMBLE---------->
        <div class="ScrambleText">
            {{scramble}}
        </div>

        <!---------MEMO/EXEC--------->
        <div :class="['StageText', waitingBeforeExec ? 'StopwatchStartSpaceDown' : '']" v-if="isSolving && props.twoStage">
            {{timerStage === stages.memoing ? "MEMO" : (timerStage === stages.executing ? "EXEC" : "")}}
        </div>

        <div class="StopwatchContainer">
            <!------STOPWATCH------>
            <div :class="getStopwatchCSSclasses()"
                 :key="solve + stopwatchKey">
                {{getSolveTimeString(solve.value)}}
            </div>

            <!---LAST SOLVE RATIO--->
            <div class="RatioText" v-if="!isSolving && ratioTextSolve.value && ratioTextSolve.value[1] != 0 && ratioTextSolve.value[1] > 0">
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
        height: 80%;
        user-select: none;
    }

    .ScrambleText {
        position: absolute;
        transform: translate(-50%, 0%);
        width: 90%;
        text-align: center;
        left: 50%;
        font-size: 2rem;
        color: var(--grey-100);
        cursor: text;
    }
    .StageText {
        width: 100%;
        text-align: center;
        position: absolute;
        left: 50%;
        transform: translate(-50%, 50%);
        font-size: 6rem;
        font-weight: bold;
        color: var(--grey-100);
        user-select: none;
    }

    .StopwatchText {
        width: 100%;
        text-align: center;
        font-size: 7rem;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        color: var(--grey-100);
        position: absolute;

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
        transform: translate(0%,5rem);
    }
</style>