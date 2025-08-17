<script setup>
    import { ref, inject } from 'vue'
    import { useTimerStore } from "../stores/TimerStore"
    const timerStore = useTimerStore()
    timerStore.loadState()
    const confirmDialog = inject('confirmDialog')
    import SessionSelect from "@/components/Timer/SessionSelect.vue"
    import SessionSettings from "@/components/Timer/SessionSettings.vue"
    import SessionDetails from "@/components/Timer/SessionDetails.vue"
    import SolveDetails from "@/components/Timer/SolveDetails.vue"
    import SolveList from "@/components/Timer/SolveList.vue"
    import Timer from "@/components/Timer.vue";

    const sessionID = ref(-1);
    const solveIndex = ref(-1);

    function updateSessionID(index) {
        if (sessionID.value != timerStore.sessions[index].id) {
            sessionID.value = timerStore.sessions[index].id;
            solveIndex.value = -1
        }
    }
    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
        solveIndex.value = timerStore.getSession(sessionID.value).solves.length - 1
    }
    function selectSolve(index) {
        solveIndex.value = index
    }
    async function DeleteSolve() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this solve?'))) {
            return
        }
        timerStore.sessions[timerStore.getSessionIndexWithID(sessionID.value)].solves.splice(solveIndex.value, 1)
        solveIndex.value = -1
        timerStore.saveState()
    }
</script>

<template>
    <div class="TimerView" :key="sessionID">
        <div class="SideColumn">
            <SessionSelect style="width: 100%; height: 33%;"
                          :sessionID="sessionID"
                           :solveIndex="solveIndex"
                           @updateSessionID="updateSessionID"/>
            <SessionSettings style="width:100%;height:67%;"
                             :sessionID="sessionID"/>
        </div>

        <div style="width: 60vw; height: 93vh;">
            <Timer v-if="sessionID > -1"
                   :sessionID="sessionID"
                   @update:solve-complete="onSolveComplete" 
                   :key="sessionID + '-' + timerStore.sessions[timerStore.getSessionIndexWithID(sessionID)].solves.length"/>
        </div>

        <div class="SideColumn" v-if="sessionID > -1">
            <SessionDetails style="width:100%;height:50%" :sessionID="sessionID"/>

            <div class="SolvePanel">
                <SolveDetails v-if="solveIndex > -1"
                              :sessionID="sessionID" :solveIndex="solveIndex"
                              @deleteSolve="DeleteSolve" @unselectSolve="solveIndex = -1"/>

                <SolveList :sessionID="sessionID" @selectSolve="selectSolve"/>
            </div>
        </div>
        <div v-else class="SideColumn">
            <div style="color:var(--info-200)">
                Select a session to get started
            </div>
        </div>
    </div>

</template>

<style>
    .SideColumn {
        display: flex;
        flex-direction: column;
        width: 20vw;
        height: 93vh;
        color: var(--text-color);
        border: 3px solid var(--border-color);
    }

    .TimerView {
        display: flex;
        flex-direction: row;
    }

    .SolvePanel {
        position: relative;
        height: 50%;
    }
</style>
