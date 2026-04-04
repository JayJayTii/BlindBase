<script setup>
    import { ref, nextTick, watch, inject, computed } from 'vue'
    import SessionSelect from "@/components/timer/SessionSelect.vue"
    import SessionSettings from "@/components/timer/SessionSettings.vue"
    import SessionDetails from "@/components/timer/SessionDetails.vue"
    import SolveDetails from "@/components/timer/SolveDetails.vue"
    import SolveList from "@/components/timer/SolveList.vue"
    import Timer from "@/components/Timer.vue"
    import { useTimerStore } from "../stores/TimerStore"
    const timerStore = useTimerStore()
    timerStore.loadState()
    const confirmDialog = inject('confirmDialog')
    import { Scramble, get3BLDscramble } from '@/helpers/scramble.js'
    import { scramblers } from '@/helpers/solver/scramble_333_edit.js'
    
    let scramblersInitialized = false
    setTimeout(() => {
        scramblers['333'].initialize(() => { 
            scramblersInitialized = true
            if(currentSession.value.type == 1 || currentSession.value.type == 2)
                generateNewScramble()
        }, Math)
    }, 0)

    //-1 means no session selected, otherwise it is the selected session's ID
    const sessionID = ref(-1)
    const currentSession = computed({
        get: () => timerStore.getSession(sessionID.value)
    })
    const solves = computed(() => currentSession.value?.solves ?? [])

    //-1 means no solve selected and showing solve list, otherwise it is the selected solve's index
    const solveIndex = ref(-1)
    const timer = ref(null)
    async function updateSessionID(index) { //Called from SessionSelect component
        if (timerStore.sessions.length > index && sessionID.value != timerStore.sessions[index].id) {
            sessionID.value = timerStore.sessions[index].id
            solveIndex.value = -1
            previousScramble.value = ""
            currentScramble = ""
            await nextTick()
            generateNewScramble()
        }
    }
    nextTick(() => { updateSessionID(0) })

    async function deleteSession() {
        if (!await confirmDialog.value.open('Are you sure you want to delete this session?'))
            return

        timerStore.deleteSession(sessionID.value)
        sessionID.value = -1
    }

    const previousScramble = ref("")
    let currentScramble = ""
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
    generateNewScramble()

    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
        solveIndex.value = solves.value.length - 1
        generateNewScramble()
    }

    function selectSolve(index) {
        solveIndex.value = index
    }

    async function DeleteSolve() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this solve?'))) {
            return
        }
        solveIndex.value = -1 //Unselect any solve
        timerStore.deleteSolve(sessionID.value, solveIndex.value)

        await nextTick()
        timer.value.refresh()
    }

    function lastScramble() {
        timer.value.setScramble(previousScramble.value)
        previousScramble.value = ""
    }
    function nextScramble() {
        generateNewScramble()
    }
</script>

<template>
    <div :key="sessionID" style="display: flex; flex-direction: row; height: calc(100vh - var(--navbar-height) - var(--footer-height);">
        <!---------LEFT COLUMN--------->
        <div class="PanelColumn">
            <SessionSelect style="width: 100%; height: 33%;"
                           :sessionID="sessionID"
                           @updateSessionID="updateSessionID" />
            <SessionSettings style="width:100%;height:67%;"
                             :sessionID="sessionID"
                             @deleteSession="deleteSession"
                             @regenerateScramble="generateNewScramble()"/>
        </div>

        <!-----------TIMER------------>
        <div class="Panel" style="width: 60vw; height: 100%; position: relative; border: 3px solid var(--border-color);">
            <img v-if="timerStore.isValidSessionID(sessionID) && previousScramble != ''"
                 title="Last scramble"
                 src="@/assets/icons/arrow-left-long.svg"
                 class="CustomButton"
                 style="height: 2rem; top:15px; left: 5px; position:absolute; cursor: pointer; z-index: 10;"
                 @click="lastScramble()" />
            <Timer style="width:100%; height:100%;"
                   v-if="timerStore.isValidSessionID(sessionID)"
                   :lastSolve="solves.at(-1)"
                   :twoStage="true"
                   @update:solve-complete="onSolveComplete"
                   ref="timer" />
            <img v-if="timerStore.isValidSessionID(sessionID)"
                 title="Next scramble"
                 src="@/assets/icons/arrow-right-long.svg"
                 class="CustomButton"
                 style="height: 2rem; top:15px; right: 5px; position:absolute; cursor: pointer; z-index: 10;"
                 @click="nextScramble()" />
            <div style="position: absolute; bottom:0px; right: 10px; font-size:0.8rem; color:var(--grey-100);">Inspired by <a href="https://cstimer.net/" target="_blank">csTimer</a> (obviously)</div>

        </div>

        <!--------RIGHT COLUMN-------->
        <div class="PanelColumn">
            <SessionDetails style="width:100%;height:50%" :sessionID="sessionID" />

            <div style="position: relative; height: 50%;">
                <SolveDetails v-if="solveIndex > -1"
                              style="position: absolute; z-index: 10; width: 100%; height: 100%; "
                              :sessionID="sessionID" :solveIndex="solveIndex"
                              @deleteSolve="DeleteSolve" @unselectSolve="solveIndex = -1" />

                <SolveList style="width:100%;height:100%;"
                           :sessionID="sessionID"
                           @selectSolve="selectSolve" />
            </div>
        </div>
    </div>

</template>