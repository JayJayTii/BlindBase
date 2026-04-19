<script setup>
    import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
    import SessionSelect from "@/components/timer/SessionSelect.vue"
    import SessionSettings from "@/components/timer/SessionSettings.vue"
    import SessionDetails from "@/components/timer/SessionDetails.vue"
    import SolveDetails from "@/components/timer/SolveDetails.vue"
    import SolveList from "@/components/timer/SolveList.vue"
    import Timer from "@/components/Timer.vue"
    import { useTimerStore } from "../stores/TimerStore"
    const timerStore = useTimerStore()
    timerStore.loadState()
    import { Scramble, get3BLDscramble } from '@/helpers/scramble.js'
    import { scramblers } from '@/helpers/solver/scramble_333_edit.js'

    let scramblersInitialized = false
    setTimeout(() => {
        scramblers['333'].initialize(() => {
            scramblersInitialized = true
            if (!currentSession.value)
                return
                
            if (currentSession.value.type == 1 || currentSession.value.type == 2)
                generateNewScramble()
        }, Math)
    }, 0)

    //-1 means no session selected, otherwise it is the selected session's ID
    const sessionID = ref(-1)
    const currentSession = computed({
        get: () => timerStore.getSession(sessionID.value)
    })
    const solves = computed(() => currentSession.value?.solves ?? [])

    const solveIndex = ref(-1)
    const timer = ref(null)

    let currentScramble = ""
    const previousScramble = ref("")

    async function updateSessionID(id) {
        if (sessionID.value == id)
            return

        sessionID.value = id
		solveIndex.value = solves.value.length - 1
        previousScramble.value = ""
        currentScramble = ""
		await nextTick()
        generateNewScramble()
        previousScramble.value = ""
        if(timer.value)
		    timer.value.refresh()
    }
    updateSessionID(timerStore.sessions[0]?.id || -1)

	const sessionSettings = computed(() => {
		if (!timerStore.isValidSessionID(sessionID.value))
			return {}
		const { solves, name, ...rest } = timerStore.getSession(sessionID.value)
		return JSON.stringify(rest) // unstringified returns a reference that changes every time, useless for watching
    })
	watch(sessionSettings, () => {
		generateNewScramble()
    })

    async function generateNewScramble() {
        if (!currentSession.value)
            return
        previousScramble.value = currentScramble
        switch (currentSession.value.type) {
            case 0: //3x3 Blindfolded
                currentScramble = get3BLDscramble()
                break
            case 1: //3x3 Edges
                currentScramble = scramblersInitialized ? scramblers['333'].getEdgeScramble() : ''
                break
            case 2: //3x3 Corners
                currentScramble = scramblersInitialized ? scramblers['333'].getCornerScramble() : ''
                break
        }
        await nextTick()
        timer.value.setScramble(currentScramble)
    }

    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
        solveIndex.value = solves.value.length - 1
        generateNewScramble()
    }

    function selectSolve(index) {
        solveIndex.value = index
    }

    async function DeleteSolve() {
        const wasLastSolve = (solveIndex.value == currentSession.value.solves.length - 1)
        timerStore.deleteSolve(sessionID.value, solveIndex.value)

        if (currentSession.value.solves.length > 0) {
            if(wasLastSolve)
                solveIndex.value = currentSession.value.solves.length - 1
        }
        else
            solveIndex.value = -1

        await nextTick()
        timer.value.refresh()
    }

    function lastScramble() {
        timer.value.setScramble(previousScramble.value)
        currentScramble = previousScramble.value
        previousScramble.value = ""
    }
    function nextScramble() {
        generateNewScramble()
    }
    
	function handleKeydown(event) {
		if (event.code === "Space") {
            event.preventDefault()
		}
	}

	onMounted(() => { window.addEventListener('keydown', handleKeydown) })
	onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
    <div style="display: flex; flex-direction: column;">
        <div id="top-row">
            <SessionSelect :sessionID="sessionID"
                           @sessionSelected="updateSessionID" />
            <SessionSettings v-if="timerStore.isValidSessionID(sessionID)"
                             :sessionID="sessionID" />
        </div>

        <el-splitter v-if="timerStore.isValidSessionID(sessionID)" 
                     id="timer-container" style="width: 100%; height: calc(100dvh - var(--footer-height) - 150px);">
            <el-splitter-panel size="300" :resizable="false" style="background-color: var(--el-fill-color-light);">
                <SessionDetails style="width:100%;height:100%" :sessionID="sessionID" />
            </el-splitter-panel>
            <el-splitter-panel style="position: relative;">
                <el-button v-if="previousScramble != ''" style="height: 2rem; top:12px; left: 10px; width: 35px; position:absolute; cursor: pointer; z-index: 10;"
                           @click="lastScramble()" type="primary" :plain="true">
                    <el-icon :size="20"><ArrowLeft /></el-icon>
                </el-button>
                <!-----------TIMER------------>
                <Timer v-if="timerStore.isValidSessionID(sessionID)"
                       style="width:100%; height:100%;"
                       :lastSolve="solves.at(-1)"
                       :twoStage="true"
                       @update:solve-complete="onSolveComplete"
                       ref="timer" />
                <el-button style="height: 2rem; top:12px; right: 10px; width: 35px; position:absolute; cursor: pointer; z-index: 10;"
                           @click="nextScramble()" type="primary" :plain="true">
                    <el-icon :size="20"><ArrowRight /></el-icon>
                </el-button>
                <div style="position: absolute; bottom:0px; right: 10px; font-size:0.8rem;">Inspired by <a href="https://cstimer.net/" target="_blank">csTimer</a> (obviously)</div>
            </el-splitter-panel>
            <el-splitter-panel size="300" :resizable="false" style="background-color: var(--el-fill-color-light);">
                <el-splitter layout="vertical">
                    <el-splitter-panel :resizable="false" size="200">
                        <SolveDetails :sessionID="sessionID" :solveIndex="solveIndex"
                                      @deleteSolve="DeleteSolve"
                                      style="height: 100%; width: 100%;"/>
                    </el-splitter-panel>
                    <el-splitter-panel :resizable="false">
                        <SolveList style="width:100%;height:100%;"
                                   :solveIndex="solveIndex"
                                   :sessionID="sessionID"
                                   @selectSolve="selectSolve" />
                    </el-splitter-panel>
                </el-splitter>
            </el-splitter-panel>
        </el-splitter>
    </div>

</template>

<style>
	#top-row {
		display: grid;
		grid-template-columns: 290px 3fr;
		width: 100%;
		height: 40px;
		gap: 5px;
		border: 1px solid var(--el-border-color);
		border-radius: 4px;
		background-color: var(--el-fill-color-light);
	}

	#timer-container {
		border: 2px solid var(--el-border-color);
		border-radius: 4px;
	}

    .el-splitter-panel {
        padding: 5px;
    }

</style>