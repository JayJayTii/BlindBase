<script setup>
    import { ref, nextTick, watch, inject, computed } from 'vue'
    import { useTimerStore } from "../stores/TimerStore"
    const timerStore = useTimerStore()
    timerStore.loadState()

    import SessionSelect from "@/components/timer/SessionSelect.vue"
    import SessionSettings from "@/components/timer/SessionSettings.vue"
    import SessionDetails from "@/components/timer/SessionDetails.vue"
    import SolveDetails from "@/components/timer/SolveDetails.vue"
    import SolveList from "@/components/timer/SolveList.vue"
    import Timer from "@/components/Timer.vue"
    import TimerStatusOverlay from "@/components/timer/TimerStatusOverlay.vue"
    const confirmDialog = inject('confirmDialog')
    import { Scramble } from '@/helpers/scramble.js'

    //-1 means unselected
    const sessionID = ref(-1)
    const solveIndex = ref(-1)
    const timer = ref(null)
    const timerKey = ref(0)
    function updateSessionID(index) { //Called from SessionSelect component
        if (sessionID.value != timerStore.sessions[index].id) {
            sessionID.value = timerStore.sessions[index].id
            solveIndex.value = -1
            nextTick(() => { generateNewScramble() })
        }
    }
    async function deleteSession() {
        if (!await confirmDialog.value.open('Are you sure you want to delete this session?')) {
            return
        }
        timerStore.deleteSession(sessionID.value)
        sessionID.value = -1
    }

    let currentScramble = ""
    function generateNewScramble() {
        const scrambleSequence = new Scramble(20)
        const wideMoves = ['r','u','f']
        for (var i = 0; i < Math.floor(3 * Math.random()); i++) {
            scrambleSequence.add([wideMoves[Math.floor(3 * Math.random())], 1 + Math.floor(3 * Math.random())])
        }
        currentScramble = scrambleSequence.toString()
        nextTick(() => { if (timer.value) { timer.value.setScramble(currentScramble) }})
    }
    generateNewScramble()

    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
        //Set solve to latest after finishing
        solveIndex.value = timerStore.getSession(sessionID.value).solves.length - 1

        generateNewScramble()
    }
    function selectSolve(index) {
        solveIndex.value = index
    }
    const lastSolve = computed({
        get: () => timerStore.sessions[timerStore.getSessionIndexWithID(sessionID.value)].solves.at(-1)
    })
    async function DeleteSolve() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this solve?'))) {
            return
        }
        solveIndex.value = -1 //Unselect any solve
        timerStore.deleteSolve(sessionID.value, solveIndex.value)

        timerKey.value++
        nextTick(() => { if (timer.value) { timer.value.setScramble(currentScramble) } })
    }

    //The following is done to detect updates to the status of the last solve and update the timer text
    let oldLength = 0
    watch(
        () => sessionID.value === -1 ? -1
            : (timerStore.getSession(sessionID.value).solves.length === 0 ? -1
                : timerStore.getSession(sessionID.value).solves.at(-1).status + timerStore.getSession(sessionID.value).solves.length),
        (newVal) => {
            if (sessionID.value === -1)
                return
            if (oldLength !== timerStore.getSession(sessionID.value).solves.length) {
                //If it's just a new solve that changes the status, ignore it
                oldLength = timerStore.getSession(sessionID.value).solves.length
                return
            }
            timerKey.value++
            nextTick(() => { timer.value.setScramble(currentScramble) })
        }
    )
</script>

<template>
    <div style="display: flex; flex-direction: row;" :key="sessionID">
        <!---------LEFT COLUMN--------->
        <div class="PanelColumn">
            <SessionSelect style="width: 100%; height: 33%;"
                           :sessionID="sessionID"
                           :solveIndex="solveIndex"
                           @updateSessionID="updateSessionID" />
            <SessionSettings style="width:100%;height:67%;"
                             :sessionID="sessionID"
                             @deleteSession="deleteSession" />
        </div>

        <!-----------TIMER------------>
        <div class="Panel" style="width: 60vw; height: 93vh; position: relative; border: 3px solid var(--border-color);">
            <Timer style="width:100%; height:100%;"
                   v-if="timerStore.isValidSessionID(sessionID)"
                   :lastSolve="lastSolve"
                   :twoStage="true"
                   @update:solve-complete="onSolveComplete"
                   ref="timer"
                   :key="timerKey" />
            <!--:key="sessionID + '-' + JSON.stringify(timerStore.sessions[timerStore.getSessionIndexWithID(sessionID)].solves.at(-1))"-->

            <TimerStatusOverlay v-if="timerStore.isValidSessionID(sessionID) && timer && !timer.isSolving"
                                id="timerStatusOverlay"
                                @update:solve-status="timerKey++"
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
    #timerStatusOverlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin-top: 3rem;
    }
</style>