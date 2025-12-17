<script setup>
    import { ref, nextTick, watch, inject, computed } from 'vue'
    import SessionSelect from "@/components/timer/SessionSelect.vue"
    import SessionSettings from "@/components/timer/SessionSettings.vue"
    import SessionDetails from "@/components/timer/SessionDetails.vue"
    import SolveDetails from "@/components/timer/SolveDetails.vue"
    import SolveList from "@/components/timer/SolveList.vue"
    import Timer from "@/components/Timer.vue"
    import TimerStatusOverlay from "@/components/timer/TimerStatusOverlay.vue"
    import { useTimerStore } from "../stores/TimerStore"
    const timerStore = useTimerStore()
    timerStore.loadState()
    const confirmDialog = inject('confirmDialog')
    import { Scramble, get3BLDscramble } from '@/helpers/scramble.js'
    import { scramblers } from '@/helpers/solver/scramble_333_edit.js'

    //Running the initialisation asynchronously to avoid lag spike when entering timer tool
    setTimeout(() => {
        scramblers['333'].initialize(null, Math)
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
        if (sessionID.value != timerStore.sessions[index].id) {
            sessionID.value = timerStore.sessions[index].id
            solveIndex.value = -1
            await nextTick()
            generateNewScramble()
        }
    }
    async function deleteSession() {
        if (!await confirmDialog.value.open('Are you sure you want to delete this session?'))
            return

        timerStore.deleteSession(sessionID.value)
        sessionID.value = -1
    }

    let currentScramble = ""
    async function generateNewScramble() {
        if (!currentSession.value)
            return
        switch (currentSession.value.type) {
            case 0: //3x3 Blindfolded
                currentScramble = get3BLDscramble()
                break
            case 1: //3x3 Edges
                currentScramble = scramblers['333'].getEdgeScramble()
                break
            case 2: //3x3 Corners
                currentScramble = scramblers['333'].getCornerScramble()
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
</script>

<template>
    <div style="display: flex; flex-direction: row; height:93vh;" :key="sessionID">
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
            <Timer style="width:100%; height:100%;"
                   v-if="timerStore.isValidSessionID(sessionID)"
                   :lastSolve="solves.at(-1)"
                   :twoStage="true"
                   @update:solve-complete="onSolveComplete"
                   ref="timer" />
           
            <TimerStatusOverlay v-if="timerStore.isValidSessionID(sessionID) && timer && !timer.isSolving"
                                id="timerStatusOverlay"
                                @update:solve-status="nextTick(() => {timer.value.refresh()})"
                                :sessionID="sessionID" />
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

<style>
    #timerStatusOverlay{
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%,calc(-50% + 7.5rem));
    }
</style>