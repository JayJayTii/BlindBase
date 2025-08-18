<script setup>
    import { ref, inject } from 'vue'
    import { useTimerStore } from "../stores/TimerStore"
    const timerStore = useTimerStore()
    timerStore.loadState()

    import SessionSelect from "@/components/timer/SessionSelect.vue"
    import SessionSettings from "@/components/timer/SessionSettings.vue"
    import SessionDetails from "@/components/timer/SessionDetails.vue"
    import SolveDetails from "@/components/timer/SolveDetails.vue"
    import SolveList from "@/components/timer/SolveList.vue"
    import Timer from "@/components/timer/Timer.vue"
    const confirmDialog = inject('confirmDialog')

    //-1 means unselected
    const sessionID = ref(-1)
    const solveIndex = ref(-1)

    function updateSessionID(index) { //Called from SessionSelect component
        if (sessionID.value != timerStore.sessions[index].id) {
            sessionID.value = timerStore.sessions[index].id
            solveIndex.value = -1
        }
    }
    async function deleteSession() {
        if (!await confirmDialog.value.open('Are you sure you want to delete this session?')) {
            return
        }
        timerStore.deleteSession(sessionID.value)
        sessionID.value = -1
    }

    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
        //Set solve to latest after finishing
        solveIndex.value = timerStore.getSession(sessionID.value).solves.length - 1 
    }
    function selectSolve(index) {
        solveIndex.value = index
    }
    async function DeleteSolve() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this solve?'))) {
            return
        }
        timerStore.deleteSolve(sessionID.value, solveIndex.value)
        solveIndex.value = -1 //Unselect any solve
    }
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
        <div style="width: 60vw; height: 93vh; border: 3px solid var(----border-color);">
            <Timer v-if="timerStore.isValidSessionID(sessionID)"
                   :sessionID="sessionID"
                   @update:solve-complete="onSolveComplete"
                   :key="sessionID + '-' + timerStore.sessions[timerStore.getSessionIndexWithID(sessionID)].solves.length" />
        </div>

        <!--------RIGHT COLUMN-------->
        <div class="PanelColumn" v-if="timerStore.isValidSessionID(sessionID)">
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
        <div v-else class="PanelColumn">
            <div style="color:var(--info-200)">
                Select a session to get started
            </div>
        </div>
    </div>

</template>