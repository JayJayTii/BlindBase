<script setup>
    import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
    import { useTimerStore } from '../stores/TimerStore';

    const props = defineProps({
        lastSolve: Object,
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
    const solve = reactive({ ...props.lastSolve })
    let stopwatchStartTime = 0;
    let timerUpdate = null;
    function handleKeydown(event) {
        const el = document.activeElement;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return

        if (event.code === 'Space') {
            if (timerStage.value === stages.finished) {
                timerStage.value = stages.waiting //Wait for space up
                solve.value = {
                    scramble: "Fsdfhjkdfhsjdkfhskdfhjkfshjk",
                    memoTime: 0,
                    solveTime: 0,
                    dnf: false
                }
                solve.value.solveTime = 0
            }
            else if (timerStage.value === stages.executing) { //Stop timer
                clearInterval(timerUpdate)
                solve.value.solveTime = new Date().getTime() - stopwatchStartTime
                timerStage.value = stages.stopping
                emit('update:solve-complete', solve)
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
    function formatTime(ms) {
        const centiseconds = Math.floor(ms / 10)

        const hours = (Math.floor(centiseconds / 100 / 60 / 60))
        const minutes = (Math.floor(centiseconds / 100 / 60) % 60)
        const seconds = (Math.floor(centiseconds / 100) % 60)
        const hundredths = (centiseconds % 100)

        let timeStr = ""
        if (hours > 0)
            timeStr += hours.toString() + ":" + (minutes < 10 ? "0" : "")
        if (minutes > 0)
            timeStr += minutes.toString() + ":" + (seconds < 10 ? "0" : "")
        timeStr += seconds.toString() + "."
        timeStr += (hundredths < 10 ? "0" : "") + hundredths.toString()

        return timeStr
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
            U2 F2 L2 F2 L D2 R2 B2 R' U2 R B2 F L2 F2 D L R U2 B R2 Rw2 Uw
        </div>
        <div class="StageText" v-if="isSolving">{{timerStage === stages.memoing ? "MEMO" : "EXEC"}}</div>
        <div :class="['StopwatchText',
             timerStage === stages.waiting ? 'StopwatchStartSpaceDown' :
             timerStage === stages.stopping ? 'StopwatchEndSpaceDown' : '']">
            {{formatTime(solve.value?.solveTime || 0)}}
        </div>
        <div class="RatioText" v-if="!isSolving && solve.value && solve.value.memoTime > 0">
            {{formatTime(solve.value.memoTime)}} memo :
            {{formatTime(solve.value.solveTime - solve.value.memoTime)}} exec
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
        top: calc(42% + 0.5 * var(--timer-font-size));
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        text-align: center;
        color: var(--grey-100);
    }
</style>
