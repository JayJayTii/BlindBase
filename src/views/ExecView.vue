<script setup>
    import { nextTick, computed, onMounted, onUnmounted, ref } from 'vue'
    import ExecSelect from '@/components/exec/ExecSelect.vue'
    import Timer from '@/components/Timer.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation } from '@/helpers/recommendations.js'
    import { formatTime } from '@/helpers/timer.js'
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

    const solveCount = ref(1)

    const nextScramble = ref("")

    const scrambleStr = ref("")

    const lastScramble = ref("")
    const lastPieceType = ref("")
    const lastSolveTime = ref("")

    const timer = ref(null)
    const timerKey = ref(0)
    function solveComplete(solve) {
        if (solve) {
            solveCount.value++
            lastSolveTime.value = formatTime(solve.solveTime)
            lastScramble.value = scrambleStr.value
        }
        else {
            nextScramble.value = ""
        }

        if (nextScramble.value == "")
            nextScramble.value = generateScramble()

        scrambleStr.value = nextScramble.value
        nextScramble.value = generateScramble()

        timer.value.setScramble(scrambleStr.value)
    }

    function generateScramble() {
        if (fullScramble) //Full corner or edge scramble
            return (pieceType === 1) ? scramblers['333'].getCornerScramble() : scramblers['333'].getEdgeScramble()
        const pair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)]
        if (!useScramble) //Scramble is just "AB"
            return pair
        //Else scramble ends with cube at "AB" state
        const solution = GetRandomRecommendation(pieceType, pair)
        let scramble = new Sequence()
        scramble.setAlgorithmNotation(solution)
        scramble.reverse()
        return scramble.toString()
    }

    const select = ref(null)
    function updatePossiblePairs(newFullScramble, newPairs, newPieceType, newUseScramble) {
        fullScramble = newFullScramble
        possiblePairs = newPairs
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

    const currentTimerStage = computed(() => timer.value ? timer.value.timerStage : 0)

</script>

<template>
    <ExecSelect ref="select" :key="settingsStore.settings.sheets_pairorder" 
                @update:on-selected="updatePossiblePairs"/>

    <div style="display:grid;grid-template-columns:35% 30% 35%;">
        <div id="execColumn">
            <div v-show="lastScramble.length > 0" style="font-weight:bold; font-size:2rem;">
                {{solveCount - 1}}
            </div>
            <div>{{lastScramble}}</div>
        </div>
        <div>
            <div v-show="selectionFinished()" style="text-align:center; color:var(--grey-100); font-weight:bold; font-size:2rem;">
                {{solveCount}}
            </div>
            <Timer v-if="selectionFinished()"
                   :key="timerKey"
                   ref="timer"
                   :clearOnSolved="false"
                   @update:solve-complete="solveComplete"
                   style="height: 73vh;width:100%;" />
        </div>

        <div id="execColumn" v-if="selectionFinished()">
            <div style="font-weight:bold; font-size:2rem;">
                {{solveCount + 1}}
            </div>
            <div style="color:transparent;text-shadow:0 0 8px var(--grey-300);">{{nextScramble}}</div>
        </div>
    </div>
</template>

<style>
    #execColumn {
        display: flex;
        flex-direction: column;
        color: var(--grey-300);
        text-align: center;
        font-size: 1.2rem;
        height: 100%;
        padding-inline: 10%;
    }
</style>